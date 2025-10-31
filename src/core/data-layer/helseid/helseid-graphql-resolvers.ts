import { GraphQLError } from 'graphql/error'

import { QueriedPerson, Resolvers } from '@resolvers'
import { createSchema } from '@data-layer/graphql/create-schema'
import { commonQueryResolvers, typeResolvers } from '@data-layer/graphql/common-resolvers'
import { raise } from '@lib/ts'
import { pdlApiService } from '@core/services/pdl/pdl-api-service'
import { getFnrIdent, getNameFromPdl } from '@core/services/pdl/pdl-api-utils'

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
        sykmelding: () => null,
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
        opprettSykmelding: () => raise('Not Implemented'),
        synchronizeSykmelding: () => raise('Not Implemented'),
    },
    ...typeResolvers,
}

export const helseIdSchema = createSchema(helseidResolvers)
