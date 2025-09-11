import { createGraphQLHandler } from '@data-layer/graphql/yoga-server'
import { fhirSchema } from '@data-layer/fhir/fhir-graphql-resolvers'
import { multiUserFhirPlugin } from '@data-layer/fhir/multi-user/multi-user-yoga-plugin'
import { createFhirResolverContext } from '@data-layer/fhir/fhir-graphql-context'

const handler = createGraphQLHandler(fhirSchema, '/fhir/graphql', {
    context: createFhirResolverContext,
    plugins: [multiUserFhirPlugin()],
})

export { handler as GET, handler as POST }
