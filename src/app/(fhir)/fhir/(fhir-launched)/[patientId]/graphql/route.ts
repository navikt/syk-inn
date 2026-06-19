import { createFhirResolverContext } from '#data-layer/fhir/fhir-graphql-context'
import { fhirSchema } from '#data-layer/fhir/fhir-graphql-resolvers'
import { createGraphQLHandler } from '#data-layer/graphql/yoga-server'

const handler = createGraphQLHandler(fhirSchema, 'FHIR', {
    context: createFhirResolverContext,
})

export { handler as GET, handler as POST }
