import { ApolloLink } from '@apollo/client'
import { tap } from 'rxjs'

import {
    MULTI_USER_ACTIVE_PATIENT_HEADER,
    MULTI_USER_CURRENT_CONTEXT_USER_HEADER,
    MULTI_USER_SESSION_STORAGE_KEY,
} from '@data-layer/fhir/multi-user/multi-user-const'

/**
 * This link handles two distinct things:
 *  - If there is an active user ID in session storage, it is added as a header to the outgoing request.
 *  - After the request (see: pipe(tap(...))), it will check for any patient ID from the server and put
 *    it in the session storage if there is none already.
 */
export const multiUserLink = new ApolloLink((operation, forward) => {
    const activeUser = sessionStorage.getItem(MULTI_USER_SESSION_STORAGE_KEY) ?? null
    if (activeUser) {
        operation.setContext(({ headers }: { headers: Record<string, string> }) => ({
            headers: {
                ...headers,
                [MULTI_USER_ACTIVE_PATIENT_HEADER]: activeUser,
            },
        }))
    }

    return forward(operation).pipe(
        tap(() => {
            const activeUser = sessionStorage.getItem(MULTI_USER_SESSION_STORAGE_KEY) ?? null
            if (activeUser != null) {
                // sessionStorage already has an active user
                return
            }

            const context = operation.getContext()
            if (context.response?.headers != null) {
                const currentContextUser: unknown | null = context.response.headers.get(
                    MULTI_USER_CURRENT_CONTEXT_USER_HEADER,
                )
                if (currentContextUser && typeof currentContextUser === 'string') {
                    sessionStorage.setItem(MULTI_USER_SESSION_STORAGE_KEY, currentContextUser)
                }
            }
        }),
    )
})
