import { logger } from '@navikt/next-logger'
import { GraphQLError } from 'graphql/error'
import { NextRequest, NextResponse } from 'next/server'
import * as z from 'zod'

import { acceptBruksvilkar } from '#core/services/bruksvilkar/bruksvilkar-service'
import { getOrganisasjonsnummerFromFhir } from '#data-layer/fhir/mappers/organization'
import { getNameFromFhir } from '#data-layer/fhir/mappers/patient'
import { getHpr } from '#data-layer/fhir/mappers/practitioner'
import { getReadyClient } from '#data-layer/fhir/smart/ready-client'
import { bundledEnv } from '#lib/env'

const PayloadSchema = z.object({
    version: z.templateLiteral([z.number(), '.', z.number()]),
})

type ResponsePayload = {
    acceptedAt: string
    version: string
}

export async function PUT(request: NextRequest): Promise<Response> {
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

    const encounter = await readyClient.encounter.request()
    if ('error' in encounter) {
        logger.error(`Tried to accept bruksvilkår, got ${encounter.error}`)
        throw new GraphQLError('API_ERROR')
    }

    const organization = await readyClient.request(encounter.serviceProvider.reference as `Organization/${string}`)
    if ('error' in organization) {
        logger.error(`Tried to accept bruksvilkår, got ${organization.error}`)
        throw new GraphQLError('API_ERROR')
    }

    const orgnummer = getOrganisasjonsnummerFromFhir(organization)
    if (orgnummer == null) {
        logger.error('Organization without valid orgnummer')
        throw new GraphQLError('API_ERROR')
    }

    const accept: ResponsePayload = await acceptBruksvilkar(
        body.version,
        { hpr, orgnummer, name: getNameFromFhir(practitioner.name) },
        { system: readyClient.issuerName, commmitHash: bundledEnv.NEXT_PUBLIC_VERSION ?? 'missing' },
    )

    return Response.json(accept)
}
