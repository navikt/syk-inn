import { logger } from '@navikt/next-logger'
import { GraphQLError } from 'graphql/error'
import * as R from 'remeda'

import { pdlApiClient } from '#core/services/pdl/pdl-api-client'
import { getFnrIdent, formatPdlName } from '#core/services/pdl/pdl-api-utils'
import { OpprettSykmeldingMeta } from '#core/services/syk-inn-api/schema/opprett'
import { sykInnApiService } from '#core/services/syk-inn-api/syk-inn-api-service'
import { resolverInputToSykInnApiPayloadValues } from '#core/services/syk-inn-api/syk-inn-api-utils'
import { raise } from '#lib/ts'
import { QueriedPerson, Resolvers } from '#resolvers'

import { getDraftClient } from '../draft/draft-client'
import { DraftValuesSchema } from '../draft/draft-schema'
import { commonObjectResolvers, commonQueryResolvers } from '../graphql/common-resolvers'
import { commonTypeResolvers } from '../graphql/common-type-resolvers'
import { createSchema } from '../graphql/create-schema'

import { NoHelseIdCurrentPatient } from './error/Errors'
import { HelseIdGraphqlContext } from './helseid-graphql-context'

const helseidResolvers: Resolvers<HelseIdGraphqlContext> = {
    Query: {
        behandler: async (_, _args, context) => {
            return {
                hpr: context.behandler.hpr,
                navn: context.behandler.navn,
                legekontorTlf: null,
                orgnummer: null,
            }
        },
        konsultasjon: async () => ({}),
        pasient: async (_, _args, { patientIdent }) => {
            if (!patientIdent) throw new GraphQLError('MISSING_IDENT')

            const person = await pdlApiClient.getPdlPerson(patientIdent)
            if ('errorType' in person) {
                if (person.errorType === 'PERSON_NOT_FOUND') {
                    return null
                }

                throw new GraphQLError('API_ERROR')
            }

            return {
                navn: formatPdlName(person.navn),
                ident: patientIdent,
            }
        },
        sykmelding: async (_, { id: sykmeldingId }, { behandler }) => {
            const sykmelding = await sykInnApiService.getSykmelding(sykmeldingId, behandler.hpr)
            if ('error' in sykmelding) throw new GraphQLError('API_ERROR')

            return sykmelding
        },
        sykmeldinger: () => null,
        draft: async (_, { draftId }, { patientIdent, behandler }) => {
            if (patientIdent == null) throw NoHelseIdCurrentPatient()

            const draftClient = await getDraftClient()
            const draft = await draftClient.getDraft(draftId, { hpr: behandler.hpr, ident: patientIdent })

            if (draft == null) return null

            return {
                draftId,
                values: draft.values,
                lastUpdated: draft.lastUpdated,
            }
        },
        drafts: async (_, _args, { patientIdent, behandler }) => {
            if (patientIdent == null) throw NoHelseIdCurrentPatient()

            const draftClient = await getDraftClient()

            const allDrafts = await draftClient.getDrafts({ hpr: behandler.hpr, ident: patientIdent })

            return R.sortBy(allDrafts, [(it) => it.lastUpdated, 'desc'])
        },
        person: async (_, { ident }) => {
            if (!ident) throw new GraphQLError('MISSING_IDENT')

            const person = await pdlApiClient.getPdlPerson(ident)
            if ('errorType' in person) {
                if (person.errorType === 'PERSON_NOT_FOUND') {
                    return null
                }

                throw new GraphQLError('API_ERROR')
            }

            return {
                ident: getFnrIdent(person.identer) ?? raise('Person without valid FNR/DNR, hows that possible?'),
                navn: formatPdlName(person.navn),
            } satisfies QueriedPerson
        },
        ...commonQueryResolvers,
    },
    Mutation: {
        saveDraft: async (_, { draftId, values }, { patientIdent, behandler }) => {
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
            await draftClient.saveDraft(draftId, { hpr: behandler.hpr, ident: patientIdent }, parsedValues.data)

            logger.info(`Saved draft ${draftId} to draft client`)

            return {
                draftId,
                values,
                lastUpdated: new Date().toISOString(),
            }
        },
        deleteDraft: async (_, { draftId }, { patientIdent, behandler }) => {
            if (patientIdent == null) throw NoHelseIdCurrentPatient()

            const draftClient = await getDraftClient()
            await draftClient.deleteDraft(draftId, { hpr: behandler.hpr, ident: patientIdent })

            logger.info(`Deleted draft ${draftId} from draft client`)

            return true
        },
        opprettSykmelding: async (_, { draftId, meta, values, force }, { behandler, patientIdent }) => {
            if (patientIdent == null) throw NoHelseIdCurrentPatient()
            if (meta.orgnummer == null || meta.legekontorTlf == null) return { cause: 'MISSING_PRACTITIONER_INFO' }

            const opprettValues = resolverInputToSykInnApiPayloadValues(values)
            const opprettMeta: OpprettSykmeldingMeta = {
                source: `syk-inn (HelseID)`,
                sykmelderHpr: behandler.hpr,
                pasientIdent: patientIdent,
                legekontorOrgnr: meta.orgnummer,
                legekontorTlf: meta.legekontorTlf,
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
            await draftClient.deleteDraft(draftId, { hpr: behandler.hpr, ident: patientIdent })

            return result
        },
        synchronizeSykmelding: () => raise('Not Implemented'),
    },
    Konsultasjon: {
        diagnoser: async () => null,
    },
    ...commonObjectResolvers,
    ...commonTypeResolvers,
}

export const helseIdSchema = createSchema(helseidResolvers)
