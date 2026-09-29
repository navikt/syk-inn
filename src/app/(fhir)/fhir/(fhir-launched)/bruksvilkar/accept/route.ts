import { logger } from '@navikt/next-logger'
import { NextRequest, NextResponse } from 'next/server'
import * as z from 'zod'

import { acceptBruksvilkar } from '#core/services/bruksvilkar/bruksvilkar-service'
import {
    getBehandler,
    getExtendedBehandlerMeta,
    isResourceError,
} from '#data-layer/fhir/resources/fhir-resources-service'
import { getReadyClient } from '#data-layer/fhir/smart/ready-client'
import { bundledEnv } from '#lib/env'
import { failSpan, spanServerAsync } from '#lib/otel/server'

const PayloadSchema = z.object({
    version: z.templateLiteral([z.number(), '.', z.number()]),
})

type ResponsePayload = {
    acceptedAt: string
    version: string
}

export async function PUT(request: NextRequest): Promise<Response> {
    return spanServerAsync('bruksvilkar.accept', async (span) => {
        const body = PayloadSchema.parse(await request.json())
        const patientIdQueryParam = request.nextUrl.searchParams.get('patientId')

        if (!patientIdQueryParam) {
            logger.error('Missing patientId query parameter')
            return NextResponse.json({ error: 'MISSING_PATIENT_ID' }, { status: 400 })
        }

        const readyClient = await getReadyClient(patientIdQueryParam)
        if ('error' in readyClient) {
            logger.error(`Tried to accept bruksvilkår, got ${readyClient.error}`)
            return NextResponse.json({ error: readyClient.error }, { status: 401 })
        }

        const [behandler, behandlerMeta] = await Promise.all([
            getBehandler(readyClient),
            getExtendedBehandlerMeta(readyClient),
        ])

        if (isResourceError(behandler) || isResourceError(behandlerMeta)) {
            failSpan(span, 'Missing behandler or behandlerMeta')
            return NextResponse.json({ error: 'MISSING_BEHANDLER_OR_META' }, { status: 500 })
        }

        const accept: ResponsePayload = await acceptBruksvilkar(
            body.version,
            { hpr: behandler.hpr, name: behandler.navn, orgnummer: behandlerMeta.orgnummer },
            { system: readyClient.issuerName, commmitHash: bundledEnv.NEXT_PUBLIC_VERSION ?? 'missing' },
        )

        return Response.json(accept)
    })
}
