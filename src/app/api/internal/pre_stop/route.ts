import { logger } from '@navikt/next-logger'
import { NextResponse } from 'next/server'

export async function GET(): Promise<NextResponse> {
    logger.info('Next.js server: received pre stop request, waiting for 10s before starting shutdown')
    await new Promise((resolve) => setTimeout(resolve, 10000))

    logger.info('Next.js server: starting shutdown')
    return NextResponse.json({ message: 'Time to head home! *yeets self*' })
}
