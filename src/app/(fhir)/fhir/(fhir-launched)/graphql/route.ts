import { fhirSchema } from '@fhir/fhir-data/fhir-graphql-resolvers'
import { createApolloHandler } from '@graphql/apollo/apollo-server-utils'

const handler = createApolloHandler(fhirSchema)

export { handler as GET, handler as POST }
