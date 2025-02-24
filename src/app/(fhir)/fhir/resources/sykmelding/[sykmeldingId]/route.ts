import { logger } from '@navikt/next-logger'

import { sykInnApiService } from '@services/syk-inn-api/SykInnApiService'
import { ExistingSykmelding } from '@services/syk-inn-api/SykInnApiSchema'
import { isE2E, isLocalOrDemo } from '@utils/env'
import { ensureValidFhirAuth } from '@fhir/auth/verify'

export async function GET(
    request: Request,
    { params }: { params: Promise<{ sykmeldingId: string }> },
): Promise<Response> {
    const authStatus = await ensureValidFhirAuth()
    if (authStatus !== 'ok') {
        return authStatus
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
        periode: {
            fom: '2021-06-01',
            tom: '2021-06-15',
        },
        hovedDiagnose: {
            system: 'ICD-10',
            code: 'L73',
            text: 'Brudd legg/ankel',
        },
    } satisfies ExistingSykmelding)
}
