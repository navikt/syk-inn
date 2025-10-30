import { NextRequest, NextResponse, ProxyConfig } from 'next/server'

import { MOCK_HELSEID_TOKEN_NAME, sessionToTokens } from '@navikt/helseid-mock-server'
import { UNLEASH_COOKIE_NAME } from '@core/toggles/const'
import { shouldUseMockEngine } from '@dev/mock-engine'

export function proxy(request: NextRequest): NextResponse {
    const response = NextResponse.next()

    if (request.cookies.get('syk-inn-session-id')?.value == null) {
        const sessionId = crypto.randomUUID()

        response.cookies.set({
            name: 'syk-inn-session-id',
            value: sessionId,
            httpOnly: true,
            maxAge: 60 * 60 * 24 * 30,
        })
    }

    if (request.cookies.get(UNLEASH_COOKIE_NAME)?.value == null) {
        response.cookies.set(UNLEASH_COOKIE_NAME, crypto.randomUUID())
    }

    /**
     * For local, e2e and demo, we pretend to be Wonderwall, and extract the current users session and
     * set the headers that Wonderwall would normally set.
     */
    if (shouldUseMockEngine() && request.cookies.get(MOCK_HELSEID_TOKEN_NAME)?.value != null) {
        const sessionId = request.cookies.get(MOCK_HELSEID_TOKEN_NAME)?.value as string

        try {
            const session = sessionToTokens(sessionId)

            response.headers.set('Authorization', `Bearer ${session.accessToken}`)
            response.headers.set('X-Wonderwall-Id-Token', session.idToken)
        } catch {
            // User without valid session, or mock system not initialized yet
            response.cookies.delete(MOCK_HELSEID_TOKEN_NAME)
        }
    }

    return response
}

export const config: ProxyConfig = {
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
