import { Plugin } from 'graphql-yoga'
import { ReadyClient } from '@navikt/smart-on-fhir/client'

import { MULTI_USER_CURRENT_CONTEXT_USER_HEADER } from '@data-layer/fhir/multi-user/multi-user-const'

/**
 * Uses the ReadyClient already present in the GQL context (for FHIR resolvers) to set a header
 * with the current users patient ID on the response.
 *
 * This Yoga-plugin should only ever be used in conjunction with the FHIR resolvers.
 */
export function multiUserFhirPlugin(): Plugin {
    return {
        async onResponse({ response, serverContext }) {
            if (!('client' in serverContext) || !(serverContext.client instanceof ReadyClient)) {
                // If context has no client, user is probably logged out
                return
            }

            response.headers.set(MULTI_USER_CURRENT_CONTEXT_USER_HEADER, serverContext.client.patient.id)
        },
    }
}
