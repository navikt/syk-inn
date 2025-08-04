import { createGraphQLHandler } from '@data-layer/graphql/yoga-server'
import { fhirSchema } from '@data-layer/fhir/fhir-graphql-resolvers'

const handler = createGraphQLHandler(fhirSchema)

export { handler as GET, handler as POST }
