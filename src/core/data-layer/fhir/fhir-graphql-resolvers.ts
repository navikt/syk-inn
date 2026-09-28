import { logger } from '@navikt/next-logger'
import { GraphQLError } from 'graphql/error'
import { cookies } from 'next/headers'
import * as R from 'remeda'

import { pdlApiService } from '#core/services/pdl/pdl-api-service'
import { formatPdlName, getFnrIdent } from '#core/services/pdl/pdl-api-utils'
import { OpprettSykmeldingMeta } from '#core/services/syk-inn-api/schema/opprett'
import { sykInnApiService } from '#core/services/syk-inn-api/syk-inn-api-service'
import {
    resolverInputToSykInnApiPayload,
    sykInnApiSykmeldingRedactedToResolverSykmelding,
    sykInnApiSykmeldingToResolverSykmelding,
    sykInnApiSykmeldingToResolverSykmeldingFull,
} from '#core/services/syk-inn-api/syk-inn-api-utils'
import { HAS_REQUESTED_ACCESS_COOKIE_NAME } from '#core/session/cookies'
import { getHasRequestedAccessToSykmeldinger } from '#core/session/session'
import { getFlag, getUserToggles } from '#core/toggles/unleash'
import metrics from '#lib/prometheus/metrics'
import { raise } from '#lib/ts'
import { Behandler, QueriedPerson, Resolvers, RuleOutcome } from '#resolvers'

import { countDiagnoses } from '../common/diagnose-counting'
import { byCurrentOrPreviousWithOffset } from '../common/sykmelding-utils'
import { getDraftClient } from '../draft/draft-client'
import { DraftValuesSchema } from '../draft/draft-schema'
import { commonObjectResolvers, commonQueryResolvers } from '../graphql/common-resolvers'
import { commonTypeResolvers } from '../graphql/common-type-resolvers'
import { createSchema } from '../graphql/create-schema'

import { FhirGraphqlContext } from './fhir-graphql-context'
import { assertValidIdent } from './fhir-graphql-utils'
import { getAllSykmeldingMetaFromFhir } from './fhir-service'
import { getExtendedBehandlerMeta, getPasient } from './resources/fhir-resources-service'
import { fhirDiagnosisToRelevantDiagnosis } from './resources/mappers/diagnosis'
import { getIdentFromFhir } from './resources/mappers/identifiers'
import { fhirWriteService, writeQuestionnaireResponseWithFallback } from './resources/write/fhir-write-service'

const fhirResolvers: Resolvers<FhirGraphqlContext> = {
    Query: {
        behandler: async (_, _args, { client, behandler }) => {
            const meta = await getExtendedBehandlerMeta(client)

            return { ...behandler, ...meta } satisfies Behandler
        },
        pasient: async (_, _args, { client }) => {
            const pasient = await getPasient(client)
            if (pasient == null) throw new GraphQLError('API_ERROR')

            return { navn: pasient.navn, ident: pasient.ident }
        },
        konsultasjon: async () => ({}),
        sykmelding: async (_, { id: sykmeldingId }, { client, behandler }) => {
            const sykmelding = await sykInnApiService.getSykmelding(sykmeldingId, behandler.hpr)
            if ('errorType' in sykmelding) {
                throw new GraphQLError('API_ERROR')
            }

            if (sykmelding.kind === 'redacted') {
                const showRedactedFlag = getFlag('SYK_INN_SHOW_REDACTED', await getUserToggles(behandler.hpr))
                if (!showRedactedFlag) return null

                return sykInnApiSykmeldingRedactedToResolverSykmelding(sykmelding)
            }

            const existingDocumentReference = await client.request(`DocumentReference/${sykmeldingId}` as const, {
                expectNotFound: true,
            })

            return sykInnApiSykmeldingToResolverSykmelding(
                sykmelding,
                'resourceType' in existingDocumentReference ? 'COMPLETE' : 'PENDING',
            )
        },
        sykmeldinger: async (_, _args, { client, behandler }) => {
            const patient = await getPasient(client)
            if (patient == null) throw new GraphQLError('API_ERROR')

            const sykInnSykmeldinger = await sykInnApiService.getSykmeldinger(patient.ident, behandler.hpr)
            if ('errorType' in sykInnSykmeldinger) throw new GraphQLError('API_ERROR')

            /**
             * Only return kind='redacted' sykmeldinger if SYK_INN_SHOW_REDACTED is enabled for this user
             */
            const showRedactedFlag = getFlag('SYK_INN_SHOW_REDACTED', await getUserToggles(behandler.hpr))
            const sykmeldinger = showRedactedFlag
                ? sykInnSykmeldinger
                : sykInnSykmeldinger.filter((it) => it.kind !== 'redacted')

            const mappedSykmeldinger = sykmeldinger.map((it) =>
                it.kind === 'redacted'
                    ? sykInnApiSykmeldingRedactedToResolverSykmelding(it)
                    : sykInnApiSykmeldingToResolverSykmelding(it),
            )

            const [current, historical] = R.partition(mappedSykmeldinger, byCurrentOrPreviousWithOffset)

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

            const person = await pdlApiService.getPdlPerson(ident)
            if ('errorType' in person) {
                throw new GraphQLError('API_ERROR')
            }

            return {
                ident: getFnrIdent(person.identer) ?? raise('Person without valid FNR/DNR, hows that possible?'),
                navn: formatPdlName(person.navn),
            } satisfies QueriedPerson
        },
        draft: async (_, { draftId }, { client, behandler }) => {
            const patient = await client.patient.request()
            if ('error' in patient) {
                throw new GraphQLError('API_ERROR')
            }

            const ident = getIdentFromFhir(patient.identifier)
            assertValidIdent(ident)

            const draftClient = await getDraftClient()
            const draft = await draftClient.getDraft(draftId, { hpr: behandler.hpr, ident })

            if (draft == null) return null

            return {
                draftId,
                values: draft.values,
                lastUpdated: draft.lastUpdated,
            }
        },
        drafts: async (_, _args, { client, behandler }) => {
            const patient = await client.patient.request()
            if ('error' in patient) {
                throw new GraphQLError('API_ERROR')
            }

            const ident = getIdentFromFhir(patient.identifier)
            assertValidIdent(ident)

            const draftClient = await getDraftClient()
            const allDrafts = await draftClient.getDrafts({ hpr: behandler.hpr, ident })
            return R.sortBy(allDrafts, [(it) => it.lastUpdated, 'desc'])
        },
        ...commonQueryResolvers,
    },
    Mutation: {
        saveDraft: async (_, { draftId, values }, { client, behandler }) => {
            const patient = await client.patient.request()
            if ('error' in patient) {
                throw new GraphQLError('API_ERROR')
            }

            const ident = getIdentFromFhir(patient.identifier)
            assertValidIdent(ident)

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
            await draftClient.saveDraft(draftId, { hpr: behandler.hpr, ident }, parsedValues.data)

            logger.info(`Saved draft ${draftId} to draft client`)

            return {
                draftId,
                values,
                lastUpdated: new Date().toISOString(),
            }
        },
        deleteDraft: async (_, { draftId }, { client, behandler }) => {
            const patient = await client.patient.request()
            if ('error' in patient) {
                throw new GraphQLError('API_ERROR')
            }

            const ident = getIdentFromFhir(patient.identifier)
            assertValidIdent(ident)

            const draftClient = await getDraftClient()
            await draftClient.deleteDraft(draftId, { hpr: behandler.hpr, ident })

            logger.info(`Deleted draft ${draftId} from draft client`)

            return true
        },
        opprettSykmelding: async (
            _,
            { draftId, values, force },
            { client, behandler, patientIdent: contextPatientIdent },
        ) => {
            const { pasientIdent, legekontorOrgnr, legekontorTlf } = await getAllSykmeldingMetaFromFhir(client)

            if (contextPatientIdent !== pasientIdent) {
                throw new GraphQLError('PASIENT_IDENT_MISMATCH')
            }

            const opprettMeta: OpprettSykmeldingMeta = {
                source: `${client.issuerName} (FHIR)`,
                sykmelderHpr: behandler.hpr,
                pasientIdent,
                legekontorOrgnr,
                legekontorTlf,
            }
            const payload = resolverInputToSykInnApiPayload(draftId, values, opprettMeta)

            if (!force) {
                // When not forcing, we first verify the sykmelding
                const verifyResult = await sykInnApiService.verifySykmelding(payload)
                if ('errorType' in verifyResult) {
                    throw new GraphQLError('API_ERROR')
                }

                if ('status' in verifyResult && verifyResult.status !== 'OK') {
                    // There are rule outcomes, short circuit and return them
                    return {
                        status: verifyResult.status,
                        rule: verifyResult.rule ?? raise(`Rule outcome ${verifyResult.status} without rule`),
                        message: verifyResult.message ?? raise(`Rule outcome ${verifyResult.status} without message`),
                    } satisfies RuleOutcome
                }

                if (typeof verifyResult === 'object' && verifyResult.message === 'Person does not exist') {
                    return { cause: 'PATIENT_NOT_FOUND_IN_PDL' }
                }

                // No rule hits, proceed to create the sykmelding
            }

            const result = await sykInnApiService.opprettSykmelding(payload)
            if ('errorType' in result) {
                throw new GraphQLError('API_ERROR')
            }

            metrics.createdSykmelding.inc(
                {
                    hpr: behandler.hpr,
                    outcome: result.utfall.result,
                },
                1,
            )

            countDiagnoses(values, 'fhir')

            // Delete the draft after successful creation
            const draftClient = await getDraftClient()
            await draftClient.deleteDraft(draftId, { hpr: behandler.hpr, ident: pasientIdent })

            return sykInnApiSykmeldingToResolverSykmeldingFull(result, 'PENDING')
        },
        synchronizeSykmelding: async (_, { id: sykmeldingId }, { client, behandler }) => {
            const sykmelding = await sykInnApiService.getSykmelding(sykmeldingId, behandler.hpr)
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
            const conditionsByEncounter = await client.request(`Condition?encounter=${client.encounter.id}`)
            if ('error' in conditionsByEncounter) {
                throw new GraphQLError('PARSING_ERROR')
            }

            if (conditionsByEncounter.entry == null) {
                metrics.numberOfDiagnosesFetched.observe(0)
                return []
            }

            const conditionList = conditionsByEncounter.entry.map((it) => it.resource)
            metrics.numberOfDiagnosesFetched.observe(conditionList.length)

            return fhirDiagnosisToRelevantDiagnosis(conditionList)
        },
    },
    ...commonObjectResolvers,
    ...commonTypeResolvers,
}

export const fhirSchema = createSchema(fhirResolvers)
