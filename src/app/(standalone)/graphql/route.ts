import { createGraphQLHandler } from '#data-layer/graphql/yoga-server'
import { createHelseIdResolverContext } from '#data-layer/helseid/helseid-graphql-context'
import { helseIdSchema } from '#data-layer/helseid/helseid-graphql-resolvers'

const handler = createGraphQLHandler(helseIdSchema, 'HelseID', {
    context: createHelseIdResolverContext,
})

export { handler as GET, handler as POST }
