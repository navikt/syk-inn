import { NextRequest, NextResponse } from 'next/server'

import { getUserToggles, toToggleMap } from '@core/toggles/unleash'
import { getReadyClient } from '@data-layer/fhir/smart/ready-client'
import { getHpr } from '@data-layer/fhir/mappers/practitioner'

export async function GET(_: NextRequest, { params }: RouteContext<'/fhir/[patientId]/debug-user'>): Promise<Response> {
    const readyClient = await getReadyClient((await params).patientId)
    if ('error' in readyClient) {
        return NextResponse.json({ error: readyClient.error }, { status: 401 })
    }

    const practitioner = await readyClient.user.request()
    if ('error' in practitioner) {
        return NextResponse.json({ error: practitioner.error }, { status: 500 })
    }

    const hpr = getHpr(practitioner.identifier)
    if (hpr == null) {
        return NextResponse.json({ error: `No HPR for practitioner ${hpr}` }, { status: 400 })
    }

    const toggles = await getUserToggles(hpr)
    return NextResponse.json({ hpr, toggles: toToggleMap(toggles) })
}
