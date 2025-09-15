import { getAbsoluteURL } from '@lib/url'
import { createFhirHandler } from '@navikt/fhir-mock-server/next'

import { getMockStore } from './mock-storage'

const handler = createFhirHandler({
    baseUrl: getAbsoluteURL(),
    fhirPath: '/api/mocks/fhir',
    store: getMockStore,
    clients: [
        {
            clientId: 'syk-inn',
            method: 'client_secret_basic',
            clientSecret: 'dev-mode-client-secret',
        },
    ],
})

export {
    handler as GET,
    handler as POST,
    handler as PUT,
    handler as DELETE,
    handler as PATCH,
    handler as OPTIONS,
    handler as HEAD,
}
