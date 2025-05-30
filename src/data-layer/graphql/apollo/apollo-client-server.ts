import { registerApolloClient, ApolloClient, InMemoryCache } from '@apollo/client-integration-nextjs'
import { SchemaLink } from '@apollo/client/link/schema'

import { fhirSchema } from '@data-layer/fhir/fhir-graphql-resolvers'
import { helseIdSchema } from '@data-layer/helseid/helseid-graphql-resolvers'

export const {
    getClient: getFhirClient,
    query: fhirQuery,
    PreloadQuery: PreloadFhirQuery,
} = registerApolloClient(() => {
    return new ApolloClient({
        cache: new InMemoryCache(),
        link: new SchemaLink({
            schema: fhirSchema,
        }),
    })
})

export const {
    getClient: getStandaloneClient,
    query: standaloneQuery,
    PreloadQuery: PreloadStandaloneQuery,
} = registerApolloClient(() => {
    return new ApolloClient({
        cache: new InMemoryCache(),
        link: new SchemaLink({
            schema: helseIdSchema,
        }),
    })
})
