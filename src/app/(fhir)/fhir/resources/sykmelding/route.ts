import { logger } from '@navikt/next-logger'

import { isE2E, isLocalOrDemo } from '@utils/env'
import { sykInnApiService } from '@services/syk-inn-api/SykInnApiService'
import { ExistingSykmelding } from '@services/syk-inn-api/SykInnApiSchema'
import { ensureValidFhirAuth } from '@fhir/auth/verify'

export async function GET(request: Request): Promise<Response> {
    const authStatus = await ensureValidFhirAuth()
    if (authStatus !== 'ok') {
        return authStatus
    }

    // TODO: This should come from a non-fickleable source, use session?
    const ident = request.headers.get('Ident')
    if (ident == null) {
        return new Response('Missing Ident header', { status: 400 })
    }

    if (isLocalOrDemo || isE2E) {
        logger.warn('Is in demo, local or e2e, returning mocked sykmelding data')

        return handleMockedRoute()
    }

    const sykmeldinger = await sykInnApiService.getTidligereSykmeldinger(ident)

    if ('errorType' in sykmeldinger) {
        return new Response('Failed to retrieve sykmeldinger', { status: 500 })
    }

    return Response.json(sykmeldinger satisfies ExistingSykmelding[], { status: 200 })
}

function handleMockedRoute(): Response {
    return Response.json([
        {
            sykmeldingId: 'ba78036d-b63c-4c5a-b3d5-b1d1f812da8d',
            pasient: {
                fnr: '12345678910',
            },
            aktivitet: {
                type: 'GRADERT',
                fom: '2021-06-01',
                tom: '2021-06-15',
                grad: 50,
            },
            hovedDiagnose: {
                system: 'ICD-10',
                code: 'L73',
                text: 'Brudd legg/ankel',
            },
        },
        {
            sykmeldingId: 'ba78036d-b63c-4c5a-b3d5-b1d1f812da8a',
            pasient: {
                fnr: '12345678910',
            },
            aktivitet: {
                type: 'AKTIVITET_IKKE_MULIG',
                fom: '2022-04-01',
                tom: '2022-05-15',
            },
            hovedDiagnose: {
                system: 'ICD-10',
                code: 'Y01',
                text: 'Smerte i penis',
            },
        },
        {
            sykmeldingId: 'ba78036d-b63c-4c5a-b3d5-b1d1f812da8e',
            pasient: {
                fnr: '12345678910',
            },
            aktivitet: {
                type: 'AKTIVITET_IKKE_MULIG',
                fom: '2024-08-01',
                tom: '2024-09-15',
            },
            hovedDiagnose: {
                system: 'ICD-10',
                code: 'L73',
                text: 'Brudd legg/ankel',
            },
        },
    ] satisfies ExistingSykmelding[])
}
