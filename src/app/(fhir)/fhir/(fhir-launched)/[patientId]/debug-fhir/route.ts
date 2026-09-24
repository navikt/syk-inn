import { NextRequest, NextResponse } from 'next/server'

import { getReadyClient } from '#data-layer/fhir/smart/ready-client'

export async function GET(_: NextRequest, { params }: RouteContext<'/fhir/[patientId]/debug-fhir'>): Promise<Response> {
    const readyClient = await getReadyClient((await params).patientId)
    if ('error' in readyClient) {
        return NextResponse.json({ error: readyClient.error }, { status: 401 })
    }

    const batchResponse = await readyClient.batch('batch', [
        { method: 'GET', url: readyClient.user.fhirUser },
        { method: 'GET', url: readyClient.patient.reference },
    ])

    return NextResponse.json(batchResponse)
}
