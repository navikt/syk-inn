import { HttpLink } from '@apollo/client'
import { ApolloClient, InMemoryCache } from '@apollo/client-integration-nextjs'

import { pathWithBasePath } from '@utils/url'
import possibleTypesGenerated from '@data-layer/graphql/possible-types.generated'

export function makeApolloClient(): ApolloClient<unknown> {
    const httpLink = new HttpLink({
        uri: pathWithBasePath('/fhir/graphql'),
    })

    return new ApolloClient({
        cache: new InMemoryCache({ possibleTypes: possibleTypesGenerated.possibleTypes }),
        link: httpLink,
    })
}
