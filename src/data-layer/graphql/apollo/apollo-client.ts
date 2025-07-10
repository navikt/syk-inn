import { ApolloLink, from, HttpLink } from '@apollo/client'
import { ApolloClient } from '@apollo/client-integration-nextjs'
import { RetryLink } from '@apollo/client/link/retry'
import { onError } from '@apollo/client/link/error'
import { logger } from '@navikt/next-logger'

import { pathWithBasePath } from '@utils/url'
import { isDemo, isLocal } from '@utils/env'
import { spanBrowserAsync } from '@otel/browser'

import { FailingLinkDev } from '../../../devtools/api-fail-toggle/apollo-dev-tools-link'
import { AppStore } from '../../../providers/redux/store'
import { metadataActions } from '../../../providers/redux/reducers/metadata'

import { createInMemoryCache } from './apollo-client-cache'

const createErrorLink = (store: AppStore): ApolloLink =>
    onError(({ graphQLErrors }) => {
        if (graphQLErrors) {
            if (graphQLErrors.some((e) => e.extensions?.code === 'SMART_SESSION_INVALID')) {
                store.dispatch(metadataActions.setSessionExpired())
            }
        }
    })

const inferOperationName = (body: string | undefined): string => {
    if (!body) return 'UnknownOperation'

    try {
        const parsedBody = JSON.parse(body)
        return parsedBody.operationName || 'UnknownOperation'
    } catch (e) {
        logger.warn(`Failed to parse operation name from body: ${e}`)
        return 'UnknownOperation'
    }
}

export function makeApolloClient(store: AppStore) {
    return (): ApolloClient<unknown> => {
        const httpLink = new HttpLink({
            uri: pathWithBasePath('/fhir/graphql'),
            fetch: (input, options) => {
                const operationName = inferOperationName(options?.body as string | undefined)

                return spanBrowserAsync(`GQL Fetch: ${operationName}`, async () => fetch(input, options))
            },
        })

        const retryLink = new RetryLink({
            delay: { initial: 300, jitter: true },
            attempts: { max: 3 },
        })

        const errorLink = createErrorLink(store)

        const links =
            isLocal || isDemo
                ? from([errorLink, FailingLinkDev(), retryLink, httpLink])
                : from([errorLink, retryLink, httpLink])

        return new ApolloClient({
            cache: createInMemoryCache(),
            link: links,
        })
    }
}
