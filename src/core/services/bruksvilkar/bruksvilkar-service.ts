import { logger } from '@navikt/next-logger'

import { BRUKSVILKAR_VERSION } from '@features/bruksvilkar/BruksvilkarInfo'
import { productionValkey } from '@core/services/valkey/client'
import { spanServerAsync } from '@lib/otel/server'
import { raise } from '@lib/ts'

import { type BruksvilkarClient, createBruksvilkarClient } from './bruksvilkar-client'
import { versionUtils } from './utils'

const BUNDLED_VERSION = BRUKSVILKAR_VERSION

export async function hasAcceptedBruksvilkar(hpr: string): Promise<{
    acceptedAt: string
    version: string
    stale: boolean
} | null> {
    return spanServerAsync('BruksvilkarService.hasAcceptedBruksvilkar', async () => {
        const client = getClient()

        const result = await client.hasAcceptedBruksvilkar(hpr)
        if (!result) return null

        return {
            acceptedAt: result.acceptedAt,
            version: result.version,
            stale: versionUtils.isStale(result.version, BUNDLED_VERSION),
        }
    })
}

export async function acceptBruksvilkar(
    ...[version, user, meta]: Parameters<BruksvilkarClient['acceptBruksvilkar']>
): Promise<{
    acceptedAt: string
    version: string
}> {
    return spanServerAsync('BruksvilkarService.acceptBruksvilkar', async () => {
        const client = getClient()
        const versionDiff = versionUtils.relative(version, BUNDLED_VERSION)
        switch (versionDiff) {
            case 'newer':
                raise(
                    `Someone accepted a newer version (${version}) than the code version ${BUNDLED_VERSION}. This should be impossible. Is someone hacking?! (${user.hpr})`,
                )
            case 'older':
                logger.warn(
                    `Someone accepted and older (${version}) version than the code version ${BUNDLED_VERSION} (${user.hpr})`,
                )
                break
            case 'same':
                break
        }

        const acceptedAt = await client.acceptBruksvilkar(version, user, meta)
        return { acceptedAt, version }
    })
}

function getClient(): BruksvilkarClient {
    return createBruksvilkarClient(productionValkey())
}
