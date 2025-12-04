import { createGraphQLHandler } from '@data-layer/graphql/yoga-server'
import { helseIdSchema } from '@data-layer/helseid/helseid-graphql-resolvers'
import { createHelseIdResolverContext } from '@data-layer/helseid/helseid-graphql-context'

const handler = createGraphQLHandler(helseIdSchema, 'HelseID', {
    context: createHelseIdResolverContext,
})

export { handler as GET, handler as POST }
