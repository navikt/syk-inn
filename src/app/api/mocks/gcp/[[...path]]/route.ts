import { notFound } from 'next/navigation'

import { createGcpHandler } from '#dev/mocks/gcp/next'
import { isCloud } from '#lib/env'
import { getAbsoluteURL } from '#lib/url'

const handler = !isCloud
    ? createGcpHandler({
          baseUrl: getAbsoluteURL(),
          gcpPath: '/api/mocks/gcp',
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
