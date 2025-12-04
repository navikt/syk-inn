import * as R from 'remeda'
import { ApolloClient, ApolloLink, CombinedGraphQLErrors, HttpLink } from '@apollo/client'
import { RetryLink } from '@apollo/client/link/retry'
import { ErrorLink } from '@apollo/client/link/error'
import { logger } from '@navikt/next-logger'

import { spanBrowserAsync } from '@lib/otel/browser'
import { AppStore } from '@core/redux/store'
import { metadataActions } from '@core/redux/reducers/metadata'
import { pathWithBasePath } from '@lib/url'
import { isDemo, isLocal } from '@lib/env'
import { FailingLinkDev } from '@dev/tools/api-fail-toggle/apollo-dev-tools-link'
import { persistentUserLink } from '@data-layer/helseid/persistent-user/persistent-user-apollo-link'
import { ModeType } from '@core/providers/ModePaths'

import { createInMemoryCache } from './apollo-client-cache'
import { createCurrentPatientLink } from './current-patient-link'

const createErrorLink = (store: AppStore): ApolloLink =>
    new ErrorLink(({ error }) => {
        if (CombinedGraphQLErrors.is(error)) {
            if (error.errors.some((e) => e.extensions?.code === 'SMART_SESSION_INVALID')) {
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

export function makeApolloClient(store: AppStore, mode: ModeType, path: `/${string}`) {
    return (): ApolloClient => {
        const httpLink = new HttpLink({
            uri: pathWithBasePath(path),
            fetch: (input, options) => {
                const operationName = inferOperationName(options?.body as string | undefined)

                if (operationName === 'DiagnoseSearch' && options?.signal != null) {
                    options.signal = undefined
                }

                return spanBrowserAsync(`GQL Fetch (${mode}): ${operationName}`, async () => fetch(input, options))
            },
        })

        const failingDevLink = isLocal || isDemo ? FailingLinkDev() : null
        const patientLink = mode === 'FHIR' ? null : persistentUserLink
        const errorLink = createErrorLink(store)
        const retryLink = new RetryLink({
            delay: { initial: 300, jitter: true },
            attempts: { max: 3 },
        })
        const currentPatientLink = createCurrentPatientLink(store)

        return new ApolloClient({
            cache: createInMemoryCache(),
            link: ApolloLink.from(
                [errorLink, failingDevLink, retryLink, currentPatientLink, patientLink, httpLink].filter(R.isNonNull),
            ),
            devtools: { enabled: process.env.NODE_ENV === 'development' || isLocal || isDemo },
        })
    }
}
