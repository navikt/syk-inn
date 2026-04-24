import { NextRequest } from 'next/server'

import { getHpr } from '@data-layer/fhir/mappers/practitioner'
import { getReadyClient } from '@data-layer/fhir/smart/ready-client'
import { sykInnApiService } from '@core/services/syk-inn-api/syk-inn-api-service'
import { createTypstSykmelding } from '@core/pdf/pdf-service'
import { getValidPatientIdent } from '@data-layer/fhir/mappers/patient'
import { failSpan, spanServerAsync } from '@lib/otel/server'

export async function GET(
    _: NextRequest,
    { params }: RouteContext<'/fhir/[patientId]/pdf/[sykmeldingId]'>,
): Promise<Response> {
    return spanServerAsync('FHIR.pdf-route', async (span) => {
        const { patientId, sykmeldingId } = await params
        const client = await getReadyClient(patientId)
        if ('error' in client) {
            failSpan(span, `Failed to initialize client: ${client.error}`)
            return new Response('Internal server error', { status: 500 })
        }

        const practitioner = await client.user.request()
        if ('error' in practitioner) {
            failSpan(span, `Failed to fetch practitioner: ${practitioner.error}`)
            return new Response('Internal server error', { status: 500 })
        }

        const hpr = getHpr(practitioner.identifier)
        if (hpr == null) {
            failSpan(span, `Missing HPR identifier in practitioner resource`)
            return new Response('Internal server error', { status: 500 })
        }

        const patient = await client.patient.request()
        if ('error' in patient) {
            failSpan(span, `Failed to fetch patient: ${patient.error}`)
            return new Response('Internal server error', { status: 500 })
        }

        const patientIdent = getValidPatientIdent(patient.identifier)
        if (patientIdent == null) {
            failSpan(span, `Missing valid patient identifier in patient resource`)
            return new Response('Internal server error', { status: 500 })
        }

        const sykmelding = await sykInnApiService.getSykmelding(sykmeldingId, hpr)

        if ('errorType' in sykmelding) {
            failSpan(span, `Failed to get sykmelding: ${sykmelding.errorType}`)
            return new Response('Internal server error', { status: 500 })
        }

        if (sykmelding.kind === 'redacted') {
            failSpan(span, `Sykmelding is redacted, cannot generate PDF`)
            return new Response('Internal server error', { status: 500 })
        }

        const pdf = await createTypstSykmelding(sykmelding)
        if (!pdf.ok) {
            failSpan(span, `Failed to generate PDF: ${pdf.error}`)
            return new Response('Internal server error', { status: 500 })
        }

        return new Response(pdf.pdf, {
            headers: { 'Content-Type': 'application/pdf' },
            status: 200,
        })
    })
}
