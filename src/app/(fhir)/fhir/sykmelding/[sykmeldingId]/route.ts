import { logger } from '@navikt/next-logger'

import { ensureFhirApiAuthenticated } from '@fhir/auth/api-utils'
import { getSykmelding } from '@services/syk-inn-api/SykInnApiService'
import { ExistingSykmelding } from '@services/syk-inn-api/SykInnApiSchema'
import { isE2E, isLocalOrDemo } from '@utils/env'

export async function GET(
    request: Request,
    { params }: { params: Promise<{ sykmeldingId: string }> },
): Promise<Response> {
    const authStatus = await ensureFhirApiAuthenticated()
    if (authStatus !== 'ok') {
        return authStatus
    }

    const sykmeldingId = (await params).sykmeldingId
    // TODO: This should come from a non-fickleable source
    const hpr = request.headers.get('X-HPR')
    if (hpr == null) {
        return new Response('Missing X-HPR header', { status: 400 })
    }

    if (isLocalOrDemo || isE2E) {
        logger.warn('Is in demo, local or e2e, returning mocked sykmelding data')

        return handleMockedRoute()
    }

    const sykmelding = await getSykmelding(sykmeldingId, hpr)

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
            code: 'L87',
            text: 'Allergisk kontakte',
        },
    } satisfies ExistingSykmelding)
}
