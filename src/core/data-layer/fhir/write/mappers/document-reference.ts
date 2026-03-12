import { CodeableConcept, FhirDocumentReference } from '@navikt/smart-on-fhir/zod'

import { SykInnApiSykmelding } from '@core/services/syk-inn-api/schema/sykmelding'
import { getSimpleSykmeldingDescription } from '@data-layer/common/sykmelding-utils'

const SykmeldingDocumentTypeCodeableConcept: CodeableConcept = {
    system: 'urn:oid:2.16.578.1.12.4.1.1.9602',
    code: 'J01-2',
    display: 'Sykmeldinger og trygdesaker',
}

export function sykmeldingToDocumentReference(
    sykmelding: SykInnApiSykmelding,
    pdfBytes: ArrayBuffer,
    references: {
        patientId: string
        encounterId: string
        practitionerId: string
    },
): FhirDocumentReference {
    const description = getSimpleSykmeldingDescription(sykmelding.values.aktivitet)
    const base64Pdf = Buffer.from(pdfBytes).toString('base64')

    return {
        id: sykmelding.sykmeldingId,
        resourceType: 'DocumentReference',
        status: 'current',
        type: { coding: [SykmeldingDocumentTypeCodeableConcept] },
        subject: { reference: `Patient/${references.patientId}` },
        author: [{ reference: `Practitioner/${references.practitionerId}` }],
        context: { encounter: [{ reference: `Encounter/${references.encounterId}` }] },
        meta: { lastUpdated: new Date().toISOString() },
        description: description,
        content: [
            {
                attachment: {
                    title: description,
                    language: 'NO-nb',
                    contentType: 'application/pdf',
                    data: base64Pdf,
                },
            },
        ],
    }
}
