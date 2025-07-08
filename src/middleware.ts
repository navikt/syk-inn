import { NextRequest, NextResponse } from 'next/server'

import { UNLEASH_COOKIE_NAME } from '@toggles/const'

export function middleware(request: NextRequest): NextResponse {
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

    return response
}

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
