import { NextRequest, NextResponse } from 'next/server'

export function middleware(request: NextRequest): NextResponse {
    if (request.cookies.get('syk-inn-session-id')?.value != null) {
        return NextResponse.next()
    }

    const response = NextResponse.next()
    const sessionId = crypto.randomUUID()
    response.cookies.set({
        name: 'syk-inn-session-id',
        value: sessionId,
        httpOnly: true,
        maxAge: 8 * 60 * 60,
    })
    return response
}

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
