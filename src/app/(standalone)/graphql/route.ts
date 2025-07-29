import { createApolloHandler } from '@data-layer/graphql/apollo/apollo-server-utils'
import { helseIdSchema } from '@data-layer/helseid/helseid-graphql-resolvers'

const handler = createApolloHandler(helseIdSchema)

export { handler as GET, handler as POST }
