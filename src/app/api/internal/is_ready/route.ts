import { NextResponse } from 'next/server'
import { logger } from '@navikt/next-logger'

import { getServerEnv } from '@lib/env'

export async function GET(): Promise<NextResponse> {
    try {
        getServerEnv()
    } catch (e) {
        logger.error(e)
        return NextResponse.json({ message: 'I am not ready :(' }, { status: 500 })
    }

    return NextResponse.json({ message: 'I am ready :)' })
}
