import { CodeableConcept, FhirDocumentReference } from '@navikt/fhir-zod'

const SykmeldingDocumentTypeCodeableConcept: CodeableConcept = {
    system: 'urn:oid:2.16.578.1.12.4.1.1.9602',
    code: 'J01-2',
    display: 'Sykmeldinger og trygdesaker',
}

export function createNewDocumentReferencePayload(
    params: {
        sykmeldingId: string
        patientId: string
        practitionerId: string
        encounterId: string
        description: string
    },
    base64Pdf: string,
): FhirDocumentReference {
    return {
        id: params.sykmeldingId,
        resourceType: 'DocumentReference',
        status: 'current',
        type: { coding: [SykmeldingDocumentTypeCodeableConcept] },
        subject: { reference: `Patient/${params.patientId}` },
        author: [{ reference: `Practitioner/${params.practitionerId}` }],
        meta: { lastUpdated: new Date().toISOString() },
        description: params.description,
        content: [
            {
                attachment: {
                    title: 'My cool sykmelding document',
                    language: 'NO-nb',
                    contentType: 'application/pdf',
                    data: base64Pdf,
                },
            },
        ],
        context: { encounter: [{ reference: `Encounter/${params.encounterId}` }] },
    }
}
