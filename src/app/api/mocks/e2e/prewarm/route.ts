import { after, NextResponse } from 'next/server'
import { logger } from '@navikt/next-logger'

import { getLoopbackURL } from '@utils/url'

export function GET(): NextResponse {
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
