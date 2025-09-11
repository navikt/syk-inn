import { createGraphQLHandler } from '@data-layer/graphql/yoga-server'
import { createFhirResolverContext, fhirSchema } from '@data-layer/fhir/fhir-graphql-resolvers'

const handler = createGraphQLHandler(fhirSchema, '/fhir/graphql', createFhirResolverContext)

export { handler as GET, handler as POST }
