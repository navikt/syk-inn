import { NextResponse } from 'next/server'

import { getUserlessToggles, getUserToggles, toToggleMap } from '@core/toggles/unleash'
import { spanServerAsync } from '@lib/otel/server'
import { getHprFromFhirSession } from '@data-layer/fhir/fhir-service'

export async function GET(): Promise<NextResponse> {
    const [toggles, hpr] = await spanServerAsync('DebugToggles.user', async () => {
        const hpr = await getHprFromFhirSession()
        if (typeof hpr !== 'string') {
            return [await getUserlessToggles(), hpr]
        }
        return [await getUserToggles(hpr), hpr]
    })

    return NextResponse.json({ hpr, toggles: toToggleMap(toggles) })
}
