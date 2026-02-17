import { productionValkey } from '@core/services/valkey/client'
import { spanServerAsync } from '@lib/otel/server'

import { type BruksvilkarClient, createBruksvilkarClient } from './bruksvilkar-client'

export async function hasAcceptedBruksvilkar(hpr: string): Promise<{
    acceptedAt: string
    version: string
} | null> {
    return spanServerAsync('BruksvilkarService.hasAcceptedBruksvilkar', async () => {
        const client = getClient()

        const result = await client.hasAcceptedBruksvilkar(hpr)
        if (!result) return null

        return {
            acceptedAt: result.acceptedAt,
            version: result.version,
        }
    })
}

export async function acceptBruksvilkar(
    hpr: string,
    name: string,
    version: string,
): Promise<{
    acceptedAt: string
    version: string
}> {
    return spanServerAsync('BruksvilkarService.acceptBruksvilkar', async () => {
        const client = getClient()

        const acceptedAt = await client.acceptBruksvilkar(hpr, name, version)

        return { acceptedAt, version }
    })
}

function getClient(): BruksvilkarClient {
    return createBruksvilkarClient(productionValkey())
}
