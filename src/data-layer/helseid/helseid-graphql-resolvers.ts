import { Resolvers } from '@resolvers'
import { createSchema } from '@graphql/create-schema'

export const helseidResolvers: Resolvers = {
    Query: {
        pasient: () => ({
            ident: 'woo',
            navn: 'Navn',
            fastlege: {
                navn: 'Fastlegessen',
                hpr: '123456',
            },
        }),
    },
}

export const helseIdSchema = createSchema(helseidResolvers)
