import { Resolvers } from '@resolvers'
import { createSchema } from '@data-layer/graphql/create-schema'
import { commonQueryResolvers, typeResolvers } from '@data-layer/graphql/common-resolvers'
import { raise } from '@lib/ts'

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
        person: () => null,
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
