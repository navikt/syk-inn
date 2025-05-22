import { registerApolloClient, ApolloClient, InMemoryCache } from '@apollo/client-integration-nextjs'
import { SchemaLink } from '@apollo/client/link/schema'

import { fhirSchema } from '@fhir/fhir-data/fhir-graphql-resolvers'

import { helseIdSchema } from '../../helseid/helseid-data/helseid-graphql-resolvers'

export const {
    getClient: getFhirClient,
    query: fhirQuery,
    PreloadQuery: PreloadFhirQuery,
} = registerApolloClient(() => {
    return new ApolloClient({
        cache: new InMemoryCache(),
        link: new SchemaLink({
            schema: fhirSchema,
            context: (operation) => operation,
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
            context: (operation) => operation,
        }),
    })
})
