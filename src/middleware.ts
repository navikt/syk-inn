import { NextRequest, NextResponse } from 'next/server'
import { logger } from '@navikt/next-logger'

import { UNLEASH_COOKIE_NAME } from './toggles/cookie'
import { getFlag, getToggles } from './toggles/unleash'

export function middleware(request: NextRequest): Promise<NextResponse> {
    const response = NextResponse.next()

    if (request.cookies.get('syk-inn-session-id')?.value == null) {
        const sessionId = crypto.randomUUID()
        response.cookies.set({
            name: 'syk-inn-session-id',
            value: sessionId,
            httpOnly: true,
            maxAge: 8 * 60 * 60,
        })
    }

    if (request.cookies.get(UNLEASH_COOKIE_NAME)?.value == null) {
        response.cookies.set(UNLEASH_COOKIE_NAME, crypto.randomUUID())
    }

    return rewriteToggledPath(request, response)
}

async function rewriteToggledPath(request: NextRequest, response: NextResponse): Promise<NextResponse> {
    const secureAuthToggle = getFlag('SYK_INN_SECURE_AUTH', await getToggles())

    logger.info(
        `Should path (${request.nextUrl.pathname}) be rewritten? Toggle (${secureAuthToggle?.name}): ${secureAuthToggle?.enabled}`,
    )
    if (!secureAuthToggle.enabled || !request.nextUrl.pathname.startsWith('/fhir')) {
        logger.info('No rewrite')
        return response
    }

    const nextUrl = request.nextUrl
    nextUrl.pathname = nextUrl.pathname.replace('/fhir', '/fhir-secure')

    logger.info(`Rewriting to ${nextUrl.pathname}`)
    return NextResponse.rewrite(nextUrl, response)
}

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
