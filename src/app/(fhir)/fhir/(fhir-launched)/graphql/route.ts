import { createApolloHandler } from '@graphql/apollo/apollo-server-utils'
import { fhirSchema } from '@fhir/fhir-graphql-resolvers'

const handler = createApolloHandler(fhirSchema)

export { handler as GET, handler as POST }
