import { createGraphQLHandler } from '@data-layer/graphql/yoga-server'
import { fhirSchema } from '@data-layer/fhir/fhir-graphql-resolvers'
import { FhirGraphQLContext } from '@data-layer/fhir/fhir-graphql-context'

const handler = createGraphQLHandler<FhirGraphQLContext>(fhirSchema, '/fhir/graphql', (ctx) => {
    const activePatient = ctx.request.headers.get('FHIR-Active-Patient') ?? null

    return { activePatient }
})

export { handler as GET, handler as POST }
