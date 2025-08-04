import { createGraphQLHandler } from '@data-layer/graphql/yoga-server'
import { helseIdSchema } from '@data-layer/helseid/helseid-graphql-resolvers'

const handler = createGraphQLHandler(helseIdSchema, '/graphql')

export { handler as GET, handler as POST }
