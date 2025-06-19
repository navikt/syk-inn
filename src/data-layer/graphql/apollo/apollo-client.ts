import { ApolloLink, from, HttpLink } from '@apollo/client'
import { ApolloClient, InMemoryCache } from '@apollo/client-integration-nextjs'
import { RetryLink } from '@apollo/client/link/retry'
import { onError } from '@apollo/client/link/error'
import { Span } from '@opentelemetry/api'
import { logger } from '@navikt/next-logger'

import { pathWithBasePath } from '@utils/url'
import { isLocalOrDemo } from '@utils/env'
import possibleTypesGenerated from '@graphql/possible-types.generated'
import { otelLink } from '@graphql/apollo/apollo-otel-link'
import { spanAsync } from '@otel/otel'

import { FailingLinkDev } from '../../../devtools/api-fail-toggle/apollo-dev-tools-link'
import { AppStore } from '../../../providers/redux/store'
import { metadataActions } from '../../../providers/redux/reducers/metadata'

const createErrorLink = (store: AppStore): ApolloLink =>
    onError(({ networkError, graphQLErrors, operation }) => {
        if (graphQLErrors) {
            if (graphQLErrors.some((e) => e.extensions?.code === 'SMART_SESSION_INVALID')) {
                store.dispatch(metadataActions.setSessionExpired())
            }
        }

        try {
            const span = operation.getContext().span
            if (span != null) {
                const otelSpan = span as Span
                if (networkError) {
                    otelSpan.recordException(networkError)
                }
                graphQLErrors?.forEach((gqlError) => {
                    otelSpan.recordException(gqlError)
                })
            }
        } catch (e) {
            logger.warn(`Something went strangely wrong recording span errors: ${e}`)
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

                return spanAsync(`GQL Fetch: ${operationName}`, async () => fetch(input, options))
            },
        })

        const retryLink = new RetryLink({
            delay: { initial: 300, jitter: true },
            attempts: { max: 3 },
        })

        const errorLink = createErrorLink(store)

        const links = isLocalOrDemo
            ? from([otelLink, errorLink, FailingLinkDev(), retryLink, httpLink])
            : from([otelLink, errorLink, retryLink, httpLink])

        return new ApolloClient({
            cache: new InMemoryCache({
                typePolicies: {
                    OpprettSykmeldingDraft: {
                        keyFields: ['draftId'],
                    },
                },
                possibleTypes: possibleTypesGenerated.possibleTypes,
            }),
            link: links,
        })
    }
}
