import { createHelseIdHandler } from '@navikt/helseid-mock-server/next'
import { getAbsoluteURL } from '@lib/url'

import { getHelseIdMockStore } from './mock-storage'

const handler = createHelseIdHandler({
    baseUrl: getAbsoluteURL(),
    helseIdPath: '/api/mocks/helseid',
    store: getHelseIdMockStore,
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
