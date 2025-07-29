import { loadSchemaSync } from '@graphql-tools/load'
import { GraphQLFileLoader } from '@graphql-tools/graphql-file-loader'
import { makeExecutableSchema } from '@graphql-tools/schema'
import { GraphQLSchema } from 'graphql/type'

import { Resolvers } from '@resolvers'

const typeDefs = loadSchemaSync('**/*.graphqls', {
    loaders: [new GraphQLFileLoader()],
})

export function createSchema(resolvers: Resolvers): GraphQLSchema {
    return makeExecutableSchema({
        typeDefs,
        resolvers,
    })
}
