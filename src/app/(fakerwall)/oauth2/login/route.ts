import { notFound, redirect, RedirectType } from 'next/navigation'
import { NextRequest } from 'next/server'

import { shouldUseMockEngine } from '#dev/mock-engine'
import { pathWithBasePath } from '#lib/url'

/**
 * Fake wonderwall /oauth2/login endpoint that just initiates the HelseID-mock as normal.
 */
export function GET(request: NextRequest): Response {
    if (!shouldUseMockEngine()) notFound()

    const finalRedirect = request.nextUrl.searchParams.get('redirect')
    if (finalRedirect == null) {
        return new Response('Missing redirect query parameter', { status: 400 })
    }

    redirect(
        pathWithBasePath(`/api/mocks/helseid/dev/start-user?user=Johan Johansson&returnTo=${finalRedirect}`),
        RedirectType.replace,
    )
}
