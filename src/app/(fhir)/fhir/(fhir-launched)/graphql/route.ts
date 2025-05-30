import { createApolloHandler } from '@data-layer/graphql/apollo/apollo-server-utils'
import { fhirSchema } from '@data-layer/fhir/fhir-graphql-resolvers'

const handler = createApolloHandler(fhirSchema)

export { handler as GET, handler as POST }
