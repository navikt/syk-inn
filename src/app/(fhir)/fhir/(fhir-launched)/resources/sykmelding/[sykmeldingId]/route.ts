import { logger } from '@navikt/next-logger'

import { sykInnApiService } from '@services/syk-inn-api/SykInnApiService'
import { ExistingSykmelding } from '@services/syk-inn-api/SykInnApiSchema'
import { isE2E, isLocalOrDemo } from '@utils/env'

import { getReadyClient } from '../../../../../../../data-layer/fhir/smart-client'

export async function GET(
    request: Request,
    { params }: { params: Promise<{ sykmeldingId: string }> },
): Promise<Response> {
    const client = await getReadyClient({ validate: true })
    if ('error' in client) {
        if (client.error === 'INVALID_TOKEN') {
            logger.error('Session expired or invalid token')
            return new Response('Unauthorized', { status: 401 })
        }

        logger.error(`Failed to instantiate SmartClient(ReadyClient), reason: ${client.error}`)
        return new Response('Internal server error', { status: 500 })
    }

    // TODO: This should come from a non-fickleable source, use session?
    const hpr = request.headers.get('HPR')
    if (hpr == null) {
        return new Response('Missing HPR header', { status: 400 })
    }
    const sykmeldingId = (await params).sykmeldingId

    if (isLocalOrDemo || isE2E) {
        logger.warn('Is in demo, local or e2e, returning mocked sykmelding data')

        return handleMockedRoute()
    }

    const sykmelding = await sykInnApiService.getSykmelding(sykmeldingId, hpr)

    if ('errorType' in sykmelding) {
        return new Response('Failed to retrieve sykmelding', { status: 500 })
    }

    return Response.json(sykmelding satisfies ExistingSykmelding, { status: 200 })
}

function handleMockedRoute(): Response {
    return Response.json({
        sykmeldingId: 'ba78036d-b63c-4c5a-b3d5-b1d1f812da8d',
        pasient: {
            fnr: '12345678910',
        },
        aktivitet: {
            type: 'AKTIVITET_IKKE_MULIG',
            fom: '2024-02-15',
            tom: '2024-02-18',
        },
        hovedDiagnose: {
            system: 'ICD-10',
            code: 'L73',
            text: 'Brudd legg/ankel',
        },
    } satisfies ExistingSykmelding)
}
