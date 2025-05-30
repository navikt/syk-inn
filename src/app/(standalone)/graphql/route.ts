import { createApolloHandler } from '@graphql/apollo/apollo-server-utils'
import { helseIdSchema } from '@helseid/helseid-graphql-resolvers'

const handler = createApolloHandler(helseIdSchema)

export { handler as GET, handler as POST }
