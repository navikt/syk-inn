import { productionValkey } from '@core/services/valkey/client'

import { type BruksvilkarClient, createBruksvilkarClient } from './bruksvilkar-client'

export async function hasAcceptedBruksvilkar(hpr: string): Promise<{
    acceptedAt: string
} | null> {
    const client = getClient()

    const result = await client.hasAcceptedBruksvilkar(hpr)
    if (!result) {
        return null
    }

    return {
        acceptedAt: result.acceptedAt,
    }
}

function getClient(): BruksvilkarClient {
    return createBruksvilkarClient(productionValkey())
}
