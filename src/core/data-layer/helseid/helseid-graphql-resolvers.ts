import { GraphQLError } from 'graphql/error'

import { QueriedPerson, Resolvers } from '@resolvers'
import { createSchema } from '@data-layer/graphql/create-schema'
import { commonQueryResolvers, typeResolvers } from '@data-layer/graphql/common-resolvers'
import { raise } from '@lib/ts'
import { pdlApiService } from '@core/services/pdl/pdl-api-service'
import { getFnrIdent, getNameFromPdl } from '@core/services/pdl/pdl-api-utils'
import { assertIsPilotUser } from '@data-layer/fhir/fhir-graphql-utils'
import { OpprettSykmeldingMeta } from '@core/services/syk-inn-api/schema/opprett'
import {
    resolverInputToSykInnApiPayload,
    sykInnApiSykmeldingRedactedToResolverSykmelding,
    sykInnApiSykmeldingToResolverSykmelding,
} from '@core/services/syk-inn-api/syk-inn-api-utils'
import { sykInnApiService } from '@core/services/syk-inn-api/syk-inn-api-service'
import { getFlag, getUserToggles } from '@core/toggles/unleash'

import { HelseIdGraphqlContext } from './helseid-graphql-context'

const helseidResolvers: Resolvers<HelseIdGraphqlContext> = {
    Query: {
        behandler: async (_, _args, context) => {
            return {
                hpr: context.hpr,
                navn: context.name,
                legekontorTlf: 'TODO',
                orgnummer: 'TODO',
            }
        },
        konsultasjon: () => null,
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
        draft: () => null,
        drafts: () => null,
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
        saveDraft: () => raise('Not Implemented'),
        deleteDraft: () => raise('Not Implemented'),
        opprettSykmelding: async (_, { ident, values, force }, { hpr }) => {
            await assertIsPilotUser(hpr)

            const meta: OpprettSykmeldingMeta = {
                source: `syk-inn (HelseID)`,
                sykmelderHpr: hpr,
                pasientIdent: ident,
                legekontorOrgnr: 'TODO',
                legekontorTlf: 'TODO',
            }

            const payload = resolverInputToSykInnApiPayload(values, meta)

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

            // TODO: Delete from draft

            return sykInnApiSykmeldingToResolverSykmelding(result, 'PENDING')
        },
        synchronizeSykmelding: () => raise('Not Implemented'),
    },
    ...typeResolvers,
}

export const helseIdSchema = createSchema(helseidResolvers)
