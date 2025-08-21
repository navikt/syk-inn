import { Resolvers } from '@resolvers'
import { createSchema } from '@data-layer/graphql/create-schema'
import { commonQueryResolvers, typeResolvers } from '@data-layer/graphql/common-resolvers'

const helseidResolvers: Resolvers = {
    Query: {
        pasient: () => ({
            ident: 'woo',
            navn: 'Navn',
            fastlege: {
                navn: 'Fastlegessen',
                hpr: '123456',
            },
        }),
        ...commonQueryResolvers,
    },
    ...typeResolvers,
}

export const helseIdSchema = createSchema(helseidResolvers)
