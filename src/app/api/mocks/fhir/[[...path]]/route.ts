import { getAbsoluteURL } from '@utils/url'
import { createFhirHandler } from '@navikt/fhir-mock-server/next'

const handler = createFhirHandler({
    baseUrl: getAbsoluteURL(),
    fhirPath: '/api/mocks/fhir',
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
