import { getAbsoluteURL } from '@utils/url'
import { bundledEnv } from '@utils/env'
import { createFhirHandler } from '@navikt/fhir-mock-server/next'

const handler = createFhirHandler({
    baseUrl: getAbsoluteURL(),
    fhirPath: '/api/mocks/fhir',
    basePath: bundledEnv.NEXT_PUBLIC_BASE_PATH,
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
