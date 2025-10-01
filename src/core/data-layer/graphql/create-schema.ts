import { addResolversToSchema } from '@graphql-tools/schema'
import { GraphQLSchema } from 'graphql/type'
import { buildClientSchema, IntrospectionQuery } from 'graphql'

import { Resolvers } from '@resolvers'

import introspectionSchema from './generated/schema.generated.json'

export function createSchema(resolvers: Resolvers): GraphQLSchema {
    const base = buildClientSchema(introspectionSchema as unknown as IntrospectionQuery)

    return addResolversToSchema({
        schema: base,
        resolvers,
    })
}
