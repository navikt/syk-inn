import { NextResponse } from 'next/server'
import { logger } from '@navikt/next-logger'

import { getServerEnv } from '@utils/env'

// TODO: Remove when next 15
export const dynamic = 'force-dynamic'

export async function GET(): Promise<NextResponse> {
    try {
        getServerEnv()
    } catch (e) {
        logger.error(e)
        return NextResponse.json({ message: 'I am not ready :(' }, { status: 500 })
    }

    return NextResponse.json({ message: 'I am ready :)' })
}
