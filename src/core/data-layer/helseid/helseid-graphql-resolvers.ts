import { GraphQLError } from 'graphql/error'
import { logger } from '@navikt/next-logger'
import * as R from 'remeda'

import { QueriedPerson, Resolvers } from '@resolvers'
import { createSchema } from '@data-layer/graphql/create-schema'
import { commonQueryResolvers, typeResolvers } from '@data-layer/graphql/common-resolvers'
import { raise } from '@lib/ts'
import { pdlApiService } from '@core/services/pdl/pdl-api-service'
import { getFnrIdent, getNameFromPdl } from '@core/services/pdl/pdl-api-utils'
import { OpprettSykmeldingMeta } from '@core/services/syk-inn-api/schema/opprett'
import {
    resolverInputToSykInnApiPayload,
    sykInnApiSykmeldingRedactedToResolverSykmelding,
    sykInnApiSykmeldingToResolverSykmelding,
    sykInnApiSykmeldingToResolverSykmeldingFull,
} from '@core/services/syk-inn-api/syk-inn-api-utils'
import { sykInnApiService } from '@core/services/syk-inn-api/syk-inn-api-service'
import { getFlag, getUserToggles } from '@core/toggles/unleash'
import { DraftValuesSchema } from '@data-layer/draft/draft-schema'
import { getDraftClient } from '@data-layer/draft/draft-client'
import { NoHelseIdCurrentPatient } from '@data-layer/helseid/error/Errors'

import { HelseIdGraphqlContext } from './helseid-graphql-context'

const helseidResolvers: Resolvers<HelseIdGraphqlContext> = {
    Query: {
        behandler: async (_, _args, context) => {
            return {
                hpr: context.hpr,
                navn: context.name,
                legekontorTlf: null,
                orgnummer: null,
            }
        },
        konsultasjon: () => ({ diagnoser: [] }),
        pasient: () => null,
        sykmelding: async (_, { id: sykmeldingId }, { hpr }) => {
            const sykmelding = await sykInnApiService.getSykmelding(sykmeldingId, hpr)
            if ('errorType' in sykmelding) {
                throw new GraphQLError('API_ERROR')
            }

            if (sykmelding.kind === 'redacted') {
                const showRedactedFlag = getFlag('SYK_INN_SHOW_REDACTED', await getUserToggles(hpr))
                if (!showRedactedFlag) return null

                return sykInnApiSykmeldingRedactedToResolverSykmelding(sykmelding)
            }

            return sykInnApiSykmeldingToResolverSykmelding(sykmelding, 'PENDING')
        },
        sykmeldinger: () => null,
        draft: async (_, { draftId }, { patientIdent, hpr }) => {
            if (patientIdent == null) throw NoHelseIdCurrentPatient()

            const draftClient = await getDraftClient()
            const draft = await draftClient.getDraft(draftId, { hpr, ident: patientIdent })

            if (draft == null) return null

            return {
                draftId,
                values: draft.values,
                lastUpdated: draft.lastUpdated,
            }
        },
        drafts: async (_, _args, { patientIdent, hpr }) => {
            if (patientIdent == null) throw NoHelseIdCurrentPatient()

            const draftClient = await getDraftClient()

            const allDrafts = await draftClient.getDrafts({ hpr, ident: patientIdent })

            return R.sortBy(allDrafts, [(it) => it.lastUpdated, 'desc'])
        },
        person: async (_, { ident }) => {
            if (!ident) throw new GraphQLError('MISSING_IDENT')

            const person = await pdlApiService.getPdlPerson(ident)
            if ('errorType' in person) {
                if (person.errorType === 'PERSON_NOT_FOUND') {
                    return null
                }

                throw new GraphQLError('API_ERROR')
            }

            return {
                ident: getFnrIdent(person.identer) ?? raise('Person without valid FNR/DNR, hows that possible?'),
                navn: getNameFromPdl(person.navn),
            } satisfies QueriedPerson
        },
        ...commonQueryResolvers,
    },
    Mutation: {
        saveDraft: async (_, { draftId, values }, { patientIdent, hpr }) => {
            if (patientIdent == null) throw NoHelseIdCurrentPatient()

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
            await draftClient.saveDraft(draftId, { hpr, ident: patientIdent }, parsedValues.data)

            logger.info(`Saved draft ${draftId} to draft client`)

            return {
                draftId,
                values,
                lastUpdated: new Date().toISOString(),
            }
        },
        deleteDraft: async (_, { draftId }, { patientIdent, hpr }) => {
            if (patientIdent == null) throw NoHelseIdCurrentPatient()

            const draftClient = await getDraftClient()
            await draftClient.deleteDraft(draftId, { hpr, ident: patientIdent })

            logger.info(`Deleted draft ${draftId} from draft client`)

            return true
        },
        opprettSykmelding: async (_, { draftId, meta, values, force }, { hpr, patientIdent }) => {
            if (patientIdent == null) throw NoHelseIdCurrentPatient()

            if (meta.orgnummer == null || meta.legekontorTlf == null) {
                return { cause: 'MISSING_PRACTITIONER_INFO' }
            }

            const opprettMeta: OpprettSykmeldingMeta = {
                source: `syk-inn (HelseID)`,
                sykmelderHpr: hpr,
                pasientIdent: patientIdent,
                legekontorOrgnr: meta.orgnummer,
                legekontorTlf: meta.legekontorTlf,
            }

            const payload = resolverInputToSykInnApiPayload(values, opprettMeta)

            if (!force) {
                // When not forcing, we first verify the sykmelding
                const verifyResult = await sykInnApiService.verifySykmelding(payload)
                if (typeof verifyResult === 'object' && 'errorType' in verifyResult) {
                    throw new GraphQLError('API_ERROR')
                }

                if (typeof verifyResult === 'object' && 'status' in verifyResult) {
                    // There are rule outcomes, short circuit and return them
                    return verifyResult
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

            // Delete the draft after successful creation
            const draftClient = await getDraftClient()
            await draftClient.deleteDraft(draftId, { hpr: hpr, ident: patientIdent })

            return sykInnApiSykmeldingToResolverSykmeldingFull(result, 'PENDING')
        },
        synchronizeSykmelding: () => raise('Not Implemented'),
    },
    ...typeResolvers,
}

export const helseIdSchema = createSchema(helseidResolvers)
