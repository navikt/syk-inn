import { createHelseIdHandler } from '@navikt/helseid-mock-server'
import { notFound } from 'next/navigation'

import { isCloud } from '#lib/env'
import { getAbsoluteURL } from '#lib/url'

import { getHelseIdMockStore } from './mock-storage'

const handler = !isCloud
    ? createHelseIdHandler({
          baseUrl: getAbsoluteURL(),
          helseIdPath: '/api/mocks/helseid',
          store: getHelseIdMockStore,
      })
    : () => notFound()

export {
    handler as GET,
    handler as POST,
    handler as PUT,
    handler as DELETE,
    handler as PATCH,
    handler as OPTIONS,
    handler as HEAD,
}
