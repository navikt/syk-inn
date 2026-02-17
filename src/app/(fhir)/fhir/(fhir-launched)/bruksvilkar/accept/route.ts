import * as z from 'zod'
import { NextRequest, NextResponse } from 'next/server'
import { logger } from '@navikt/next-logger'

import { getReadyClient } from '@data-layer/fhir/smart/ready-client'
import { acceptBruksvilkar } from '@core/services/bruksvilkar/bruksvilkar-service'
import { getHpr } from '@data-layer/fhir/mappers/practitioner'
import { getNameFromFhir } from '@data-layer/fhir/mappers/patient'

const PayloadSchema = z.object({
    patientId: z.string(),
    version: z.string(),
})

type ResponsePayload = {
    acceptedAt: string
    version: string
}

export async function PUT(request: NextRequest): Promise<Response> {
    const body = PayloadSchema.parse(await request.json())
    const readyClient = await getReadyClient(body.patientId)
    if ('error' in readyClient) {
        logger.error(`Tried to accept bruksvilkår, got ${readyClient.error}`)
        return NextResponse.json({ error: readyClient.error }, { status: 401 })
    }

    const practitioner = await readyClient.user.request()
    if ('error' in practitioner) {
        logger.error(`Tried to accept bruksvilkår, got ${practitioner.error}`)
        return NextResponse.json({ error: practitioner.error }, { status: 401 })
    }

    const hpr = getHpr(practitioner.identifier)
    if (!hpr) {
        logger.error(`Tried to accept bruksvilkår, got practitioner without HPR: ${practitioner.id}`)
        return NextResponse.json({ error: 'NO_HPR' }, { status: 401 })
    }

    const accept: ResponsePayload = await acceptBruksvilkar(hpr, getNameFromFhir(practitioner.name), body.version)
    return Response.json(accept)
}
