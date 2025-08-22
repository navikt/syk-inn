import { ApolloLink, CombinedGraphQLErrors, HttpLink } from '@apollo/client'
import { ApolloClient } from '@apollo/client-integration-nextjs'
import { RetryLink } from '@apollo/client/link/retry'
import { ErrorLink } from '@apollo/client/link/error'
import { logger } from '@navikt/next-logger'

import { spanBrowserAsync } from '@lib/otel/browser'
import { AppStore } from '@core/redux/store'
import { metadataActions } from '@core/redux/reducers/metadata'
import { pathWithBasePath } from '@lib/url'
import { isDemo, isLocal } from '@lib/env'
import { FailingLinkDev } from '@dev/tools/api-fail-toggle/apollo-dev-tools-link'
import { ModeType } from '@core/providers/Modes'

import { createInMemoryCache } from './apollo-client-cache'

const createErrorLink = (store: AppStore): ApolloLink =>
    new ErrorLink(({ error }) => {
        if (CombinedGraphQLErrors.is(error)) {
            if (error.errors.some((e) => e.extensions?.code === 'SMART_SESSION_INVALID')) {
                store.dispatch(metadataActions.setSessionExpired())
            }
        }
    })

/**
 * Should this be a SetConntextLink maybe?
 */
const multiUserLink = new ApolloLink((operation, forward) => {
    const activeUser = sessionStorage.getItem('FHIR_ACTIVE_PATIENT') ?? null
    if (!activeUser) return forward(operation)

    logger.info(`Found multi launch user ID, setting ${activeUser} as FHIR-Active-Patient in Apollo Headers`)
    operation.setContext(({ headers }: { headers: Record<string, string> }) => ({
        headers: {
            ...headers,
            'FHIR-Active-Patient': activeUser,
        },
    }))

    return forward(operation)
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

export function makeApolloClient(store: AppStore, mode: ModeType) {
    return (): ApolloClient => {
        const httpLink = new HttpLink({
            uri: pathWithBasePath(mode === 'FHIR' ? '/fhir/graphql' : '/graphql'),
            fetch: (input, options) => {
                const operationName = inferOperationName(options?.body as string | undefined)

                if (operationName === 'DiagnoseSearch' && options?.signal != null) {
                    options.signal = undefined
                }

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
                ? ApolloLink.from([errorLink, FailingLinkDev(), retryLink, multiUserLink, httpLink])
                : ApolloLink.from([errorLink, retryLink, multiUserLink, httpLink])

        return new ApolloClient({
            cache: createInMemoryCache(),
            link: links,
        })
    }
}
