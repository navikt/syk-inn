import { NextRequest, NextResponse, ProxyConfig } from 'next/server'

import { MOCK_HELSEID_TOKEN_NAME, sessionToTokens } from '@navikt/helseid-mock-server'
import { UNLEASH_COOKIE_NAME } from '@core/toggles/const'
import { shouldUseMockEngine } from '@dev/mock-engine'
import { spanServerAsync } from '@lib/otel/server'

export async function proxy(request: NextRequest): Promise<NextResponse> {
    return spanServerAsync('Next Proxy', async (span) => {
        const response = NextResponse.next()

        if (request.cookies.get('syk-inn-session-id')?.value == null) {
            const sessionId = crypto.randomUUID()

            span.setAttribute('proxy.set-session-id', sessionId)

            response.cookies.set({
                name: 'syk-inn-session-id',
                value: sessionId,
                httpOnly: true,
                maxAge: 60 * 60 * 24 * 30,
            })
        }

        if (request.cookies.get(UNLEASH_COOKIE_NAME)?.value == null) {
            span.setAttribute('proxy.set-unleash-id', 'true')
            response.cookies.set(UNLEASH_COOKIE_NAME, crypto.randomUUID())
        }

        /**
         * For local, e2e and demo, we pretend to be Wonderwall, and extract the current users session and
         * set the headers that Wonderwall would normally set.
         */
        if (shouldUseMockEngine() && request.cookies.get(MOCK_HELSEID_TOKEN_NAME)?.value != null) {
            const sessionId = request.cookies.get(MOCK_HELSEID_TOKEN_NAME)?.value as string

            span.setAttribute('proxy.mock-helseid-token-session', sessionId)

            try {
                const session = sessionToTokens(sessionId)

                response.headers.set('Authorization', `Bearer ${session.accessToken}`)
                response.headers.set('X-Wonderwall-Id-Token', session.idToken)

                span.setAttribute('proxy.successfully-set-mock-headers', true)
            } catch (e) {
                span.setAttributes({
                    'proxy.unset-mock-cookie': true,
                    'proxy.unset-mock-cause': (e as Error).message,
                })

                // User without valid session, or mock system not initialized yet
                response.cookies.delete(MOCK_HELSEID_TOKEN_NAME)
            }
        }

        return response
    })
}

export const config: ProxyConfig = {
    matcher: ['/', '/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
