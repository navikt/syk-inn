import { logger } from '@navikt/next-logger'

import { sykInnApiService } from '@services/syk-inn-api/SykInnApiService'
import { isE2E, isLocalOrDemo } from '@utils/env'
import { getReadyClient } from '@data-layer/fhir/smart-client'
import { sykmeldingByIdRoute } from '@data-layer/api-routes/route-handlers'
import { getHpr } from '@data-layer/fhir/mappers/practitioner'
import { Sykmelding } from '@data-layer/resources'
import { serverFhirResources } from '@data-layer/fhir/fhir-data-server'

export const GET = sykmeldingByIdRoute(async (sykmeldingId: string) => {
    const client = await getReadyClient({ validate: true })
    if ('error' in client) {
        return { error: 'AUTH_ERROR' }
    }

    const practitioner = await client.request(`/${client.fhirUser}`)
    if ('error' in practitioner) {
        return { error: 'PARSING_ERROR' }
    }

    const hpr = getHpr(practitioner.identifier)
    if (hpr == null) {
        logger.error('Missing HPR identifier in practitioner resource')
        return { error: 'PARSING_ERROR' }
    }

    if (isLocalOrDemo || isE2E) {
        logger.info('Running in local or demo environment, returning mocked sykmelding data')
        return handleMockedRoute()
    }

    const sykmelding = await sykInnApiService.getSykmelding(sykmeldingId, hpr)
    if ('errorType' in sykmelding) {
        return { error: 'API_ERROR' }
    }

    const existingDocumentReference = await serverFhirResources.getDocumentReference(sykmeldingId)

    return {
        sykmeldingId: sykmelding.sykmeldingId,
        aktivitet: sykmelding.aktivitet,
        diagnose: {
            hoved: sykmelding.hovedDiagnose,
        },
        pasient: {
            ident: sykmelding.pasient.fnr,
        },
        documentStatus: 'resourceType' in existingDocumentReference ? 'complete' : 'pending',
    }
})

function handleMockedRoute(): Sykmelding {
    return {
        sykmeldingId: 'ba78036d-b63c-4c5a-b3d5-b1d1f812da8d',
        pasient: {
            ident: '12345678910',
        },
        aktivitet: {
            type: 'AKTIVITET_IKKE_MULIG',
            fom: '2024-02-15',
            tom: '2024-02-18',
        },
        diagnose: {
            hoved: {
                system: 'ICD-10',
                code: 'L73',
                text: 'Brudd legg/ankel',
            },
        },
        documentStatus: 'complete',
    }
}
