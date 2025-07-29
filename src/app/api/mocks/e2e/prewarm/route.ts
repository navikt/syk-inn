import { after, NextResponse } from 'next/server'
import { logger } from '@navikt/next-logger'
import { notFound } from 'next/navigation'

import { getLoopbackURL } from '@lib/url'
import { isE2E } from '@lib/env'

export function GET(): NextResponse {
    if (!isE2E) notFound()

    after(() => {
        prewarmRoutes()
    })

    return NextResponse.json({ message: 'Next.js is alive! Start the tests!' })
}

const routesToPrewarm = ['/fhir', '/fhir/launch', '/fhir/callback', '/fhir/ny', '/fhir/kvittering/foo-bar-baz']

async function prewarmRoutes(): Promise<void> {
    logger.info(`Prerendering E2E pages: ${routesToPrewarm.join('\n')}`)

    await Promise.all([
        routesToPrewarm.map(async (route) => {
            await fetch(`${getLoopbackURL()}/${route}`, { method: 'PUT' })
        }),
    ])

    logger.info('Pre-warm complete')
}
