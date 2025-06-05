import { ApolloLink, from, HttpLink } from '@apollo/client'
import { ApolloClient, InMemoryCache } from '@apollo/client-integration-nextjs'
import { RetryLink } from '@apollo/client/link/retry'
import { onError } from '@apollo/client/link/error'

import { pathWithBasePath } from '@utils/url'
import { isLocalOrDemo } from '@utils/env'
import possibleTypesGenerated from '@graphql/possible-types.generated'

import { FailingLinkDev } from '../../../devtools/api-fail-toggle/apollo-dev-tools-link'
import { AppStore } from '../../../providers/redux/store'
import { metadataActions } from '../../../providers/redux/reducers/metadata'

const createErrorLink = (store: AppStore): ApolloLink =>
    onError(({ graphQLErrors }) => {
        if (graphQLErrors) {
            if (graphQLErrors.some((e) => e.extensions?.code === 'SMART_SESSION_INVALID')) {
                store.dispatch(metadataActions.setSessionExpired())
            }
        }
    })

export function makeApolloClient(store: AppStore) {
    return (): ApolloClient<unknown> => {
        const httpLink = new HttpLink({
            uri: pathWithBasePath('/fhir/graphql'),
        })

        const retryLink = new RetryLink({
            delay: { initial: 300, jitter: true },
            attempts: { max: 3 },
        })

        const errorLink = createErrorLink(store)

        const links = isLocalOrDemo
            ? from([errorLink, FailingLinkDev(), retryLink, httpLink])
            : from([errorLink, retryLink, httpLink])

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
