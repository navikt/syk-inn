import { logger } from '@navikt/next-logger'
import { GraphQLError } from 'graphql/error'
import { cookies } from 'next/headers'
import * as R from 'remeda'

import { pdlApiClient } from '#core/services/pdl/pdl-api-client'
import { formatPdlName, getFnrIdent } from '#core/services/pdl/pdl-api-utils'
import { OpprettSykmeldingMeta } from '#core/services/syk-inn-api/schema/opprett'
import { sykInnApiClient } from '#core/services/syk-inn-api/syk-inn-api-client'
import { sykInnApiService } from '#core/services/syk-inn-api/syk-inn-api-service'
import { resolverInputToSykInnApiPayloadValues } from '#core/services/syk-inn-api/syk-inn-api-utils'
import { HAS_REQUESTED_ACCESS_COOKIE_NAME } from '#core/session/cookies'
import { getHasRequestedAccessToSykmeldinger } from '#core/session/session'
import { getUserToggles } from '#core/toggles/unleash'
import { raise } from '#lib/ts'
import { Behandler, QueriedPerson, Resolvers } from '#resolvers'

import { byCurrentOrPreviousWithOffset } from '../common/sykmelding-utils'
import { getDraftClient } from '../draft/draft-client'
import { DraftValuesSchema } from '../draft/draft-schema'
import { commonObjectResolvers, commonQueryResolvers } from '../graphql/common-resolvers'
import { commonTypeResolvers } from '../graphql/common-type-resolvers'
import { createSchema } from '../graphql/create-schema'

import { FhirGraphqlContext } from './fhir-graphql-context'
import {
    getDiagnosisInEncounter,
    getExtendedBehandlerMeta,
    getPasient,
    isResourceError,
} from './resources/fhir-resources-service'
import { fhirWriteService, writeQuestionnaireResponseWithFallback } from './resources/write/fhir-write-service'

/**
 * The resolvers are for the most part a connection between FHIR resources and the GraphQL schema
 * (used both for HelseID and FHIR modes). The resolvers are therefore supposed to be as thin as
 * possible. Any involved "business logic" or mapping should be done in the service layer where
 * possible.
 */
const fhirResolvers: Resolvers<FhirGraphqlContext> = {
    Query: {
        behandler: async (_, _args, { client, behandler }) => {
            const meta = await getExtendedBehandlerMeta(client)
            if (isResourceError(meta)) throw new GraphQLError('API_ERROR')

            return { ...behandler, ...meta } satisfies Behandler
        },
        pasient: async (_, _args, { client }) => {
            const pasient = await getPasient(client)
            if (isResourceError(pasient)) throw new GraphQLError('API_ERROR')

            return { navn: pasient.navn, ident: pasient.ident }
        },
        /**
         * Konsultasjon-values are resolved using object resolvers, but we need to satisfy the
         * Typescript-schema with a simple no-op resolver.
         */
        konsultasjon: async () => ({}),
        sykmelding: async (_, { id: sykmeldingId }, { behandler }) => {
            const sykmelding = await sykInnApiService.getSykmelding(sykmeldingId, behandler.hpr)
            if ('error' in sykmelding) throw new GraphQLError('API_ERROR')

            return sykmelding
        },
        sykmeldinger: async (_, _args, { client, behandler }) => {
            const patient = await getPasient(client)
            if (isResourceError(patient)) throw new GraphQLError('API_ERROR')

            const sykmeldinger = await sykInnApiService.getSykmeldinger(patient.ident, behandler.hpr)
            if ('error' in sykmeldinger) throw new GraphQLError('API_ERROR')

            const [current, historical] = R.partition(sykmeldinger, byCurrentOrPreviousWithOffset)

            const hasRequestedAccessToSykmeldinger = await getHasRequestedAccessToSykmeldinger(
                client.user.id,
                client.patient.id,
            )

            if (hasRequestedAccessToSykmeldinger) {
                return { aktuelle: current, historiske: historical }
            }

            return { aktuelle: current }
        },
        person: async (_, { ident }) => {
            if (!ident) throw new GraphQLError('MISSING_IDENT')

            const person = await pdlApiClient.getPdlPerson(ident)
            if ('errorType' in person) throw new GraphQLError('API_ERROR')

            return {
                ident: getFnrIdent(person.identer) ?? raise('Person without valid FNR/DNR, hows that possible?'),
                navn: formatPdlName(person.navn),
            } satisfies QueriedPerson
        },
        draft: async (_, { draftId }, { client, behandler }) => {
            const patient = await getPasient(client)
            if (isResourceError(patient)) throw new GraphQLError('API_ERROR')

            const draftClient = await getDraftClient()
            const draft = await draftClient.getDraft(draftId, { hpr: behandler.hpr, ident: patient.ident })

            if (draft == null) return null

            return {
                draftId,
                values: draft.values,
                lastUpdated: draft.lastUpdated,
            }
        },
        drafts: async (_, _args, { client, behandler }) => {
            const pasient = await getPasient(client)
            if (isResourceError(pasient)) throw new GraphQLError('API_ERROR')

            const draftClient = await getDraftClient()
            const allDrafts = await draftClient.getDrafts({ hpr: behandler.hpr, ident: pasient.ident })
            return R.sortBy(allDrafts, [(it) => it.lastUpdated, 'desc'])
        },
        ...commonQueryResolvers,
    },
    Mutation: {
        saveDraft: async (_, { draftId, values }, { client, behandler }) => {
            const pasient = await getPasient(client)
            if (isResourceError(pasient)) throw new GraphQLError('API_ERROR')

            const parsedValues = DraftValuesSchema.safeParse(values)
            if (!parsedValues.success) {
                logger.error(
                    new Error('Parsed values are not valid according to DraftValuesSchema', {
                        cause: parsedValues.error,
                    }),
                )
                throw new GraphQLError('API_ERROR')
            }

            const draftClient = await getDraftClient()
            await draftClient.saveDraft(draftId, { hpr: behandler.hpr, ident: pasient.ident }, parsedValues.data)

            logger.info(`Saved draft ${draftId} to draft client`)

            return {
                draftId,
                values,
                lastUpdated: new Date().toISOString(),
            }
        },
        deleteDraft: async (_, { draftId }, { client, behandler }) => {
            const pasient = await getPasient(client)
            if (isResourceError(pasient)) throw new GraphQLError('API_ERROR')

            const draftClient = await getDraftClient()
            await draftClient.deleteDraft(draftId, { hpr: behandler.hpr, ident: pasient.ident })

            logger.info(`Deleted draft ${draftId} from draft client`)

            return true
        },
        opprettSykmelding: async (
            _,
            { draftId, values, force },
            { client, behandler, patientIdent: contextPatientIdent },
        ) => {
            const pasient = await getPasient(client)
            if (isResourceError(pasient)) throw new GraphQLError('API_ERROR')
            if (contextPatientIdent !== pasient?.ident) throw new GraphQLError('PASIENT_IDENT_MISMATCH')

            const behandlerMeta = await getExtendedBehandlerMeta(client)
            if (isResourceError(behandlerMeta)) throw new GraphQLError('API_ERROR')

            const opprettValues = resolverInputToSykInnApiPayloadValues(values)
            const opprettMeta: OpprettSykmeldingMeta = {
                source: `${client.issuerName} (FHIR)`,
                sykmelderHpr: behandler.hpr,
                pasientIdent: pasient.ident,
                legekontorOrgnr: behandlerMeta.orgnummer,
                legekontorTlf: behandlerMeta.legekontorTlf,
            }

            const result = await sykInnApiService.opprettSykmelding(opprettMeta, opprettValues, {
                submitId: draftId,
                force,
            })

            if ('error' in result) {
                if (result.error === 'PATIENT_NOT_IN_PDL') {
                    return { cause: 'PATIENT_NOT_FOUND_IN_PDL' }
                } else {
                    throw new GraphQLError('API_ERROR')
                }
            }

            if (result.__typename === 'RuleOutcome') return result

            // Delete the draft after successful creation
            const draftClient = await getDraftClient()
            await draftClient.deleteDraft(draftId, { hpr: behandler.hpr, ident: pasient.ident })

            return result
        },
        synchronizeSykmelding: async (_, { id: sykmeldingId }, { client, behandler }) => {
            const sykmelding = await sykInnApiClient.getSykmelding(sykmeldingId, behandler.hpr)
            if ('errorType' in sykmelding) {
                throw new GraphQLError('API_ERROR')
            }

            if (sykmelding.kind === 'redacted') {
                logger.error(
                    `User ${behandler.hpr} tried to synchronize sykmelding ${sykmeldingId} - This should not happen.`,
                )
                throw new GraphQLError('API_ERROR')
            }

            const userToggles = await getUserToggles(behandler.hpr)
            const writeService = fhirWriteService(client, userToggles)

            const questionnaireRef = await writeQuestionnaireResponseWithFallback(writeService, sykmelding)
            const documentReference = await writeService.writeDocumentReference(sykmelding, questionnaireRef)

            if ('error' in documentReference) {
                // Already logged and failed span in service
                throw new GraphQLError('API_ERROR')
            }

            return { navStatus: 'COMPLETE', documentStatus: 'COMPLETE' }
        },
        requestAccessToSykmeldinger: async (_, __, { client }) => {
            // TODO: Trigger auditlog

            const cookieStore = await cookies()
            cookieStore.set({
                // TODO how to solve
                name: `${HAS_REQUESTED_ACCESS_COOKIE_NAME}_${client.user.id}_${client.patient.id}`,
                value: 'true',
                httpOnly: true,
                maxAge: 3600,
                secure: true,
            })
            return true
        },
    },
    Konsultasjon: {
        diagnoser: async (_, _args, { client }) => {
            const diagnosis = await getDiagnosisInEncounter(client)
            if (isResourceError(diagnosis)) throw new GraphQLError('API_ERROR')

            return diagnosis
        },
    },
    ...commonObjectResolvers,
    ...commonTypeResolvers,
}

export const fhirSchema = createSchema(fhirResolvers)
