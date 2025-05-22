import { HttpLink } from '@apollo/client'
import { ApolloClient, InMemoryCache } from '@apollo/client-integration-nextjs'

import { pathWithBasePath } from '@utils/url'

export function makeApolloClient(): ApolloClient<unknown> {
    const httpLink = new HttpLink({
        uri: pathWithBasePath('/fhir/graphql'),
    })

    return new ApolloClient({
        cache: new InMemoryCache(),
        link: httpLink,
    })
}
