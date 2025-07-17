import { getAbsoluteURL } from '@utils/url'
import { createFhirHandler } from '@navikt/fhir-mock-server/next'

const handler = createFhirHandler({
    baseUrl: getAbsoluteURL(),
    fhirPath: '/api/mocks/fhir',
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
