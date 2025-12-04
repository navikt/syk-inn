import { createGraphQLHandler } from '@data-layer/graphql/yoga-server'
import { fhirSchema } from '@data-layer/fhir/fhir-graphql-resolvers'
import { createFhirResolverContext } from '@data-layer/fhir/fhir-graphql-context'

const handler = createGraphQLHandler(fhirSchema, 'FHIR', {
    context: createFhirResolverContext,
})

export { handler as GET, handler as POST }
