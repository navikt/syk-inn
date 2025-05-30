import { from, HttpLink } from '@apollo/client'
import { ApolloClient, InMemoryCache } from '@apollo/client-integration-nextjs'
import { RetryLink } from '@apollo/client/link/retry'

import { pathWithBasePath } from '@utils/url'
import { isLocalOrDemo } from '@utils/env'
import possibleTypesGenerated from '@graphql/possible-types.generated'

import { FailingLinkDev } from '../../../devtools/api-fail-toggle/apollo-dev-tools-link'

export function makeApolloClient(): ApolloClient<unknown> {
    const httpLink = new HttpLink({
        uri: pathWithBasePath('/fhir/graphql'),
    })

    const retryLink = new RetryLink({
        delay: { initial: 300, jitter: true },
        attempts: { max: 3 },
    })

    const links = isLocalOrDemo ? from([FailingLinkDev(), retryLink, httpLink]) : from([retryLink, httpLink])

    return new ApolloClient({
        cache: new InMemoryCache({ possibleTypes: possibleTypesGenerated.possibleTypes }),
        link: links,
    })
}
