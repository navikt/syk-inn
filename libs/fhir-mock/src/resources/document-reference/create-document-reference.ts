import { FhirDocumentReference } from '@navikt/fhir-zod'

export function createDocumentReference(): FhirDocumentReference {
    return {
        resourceType: 'DocumentReference',
        id: 'aa66036d-b63c-4c5a-b3d5-b1d1f80000d',
        meta: {
            versionId: '1',
            lastUpdated: '2025-03-04T03:21:36.880-05:00',
        },
        status: 'current',
        type: {
            coding: [
                { system: 'urn:oid:2.16.578.1.12.4.1.1.9602', code: 'J01-2', display: 'Sykmeldinger og trygdesaker' },
            ],
        },
        subject: {
            reference: 'Patient/cd09f5d4-55f7-4a24-a25d-a5b65c7a8805',
        },
        author: [],
        content: [
            {
                attachment: {
                    contentType: 'text/plain; charset=utf-8',
                    language: 'en',
                    title: 'Sykmelding',
                    data: '',
                },
            },
        ],
        context: { encounter: [{ reference: 'Encounter/320fd29a-31b9-4c9f-963c-c6c88332d89a' }] },
    }
}

export async function getDocumentReferencesListResponse(): Promise<Response> {
    return Response.json({
        resourceType: 'Bundle',
        entry: [
            {
                fullUrl: 'DocumentReference/aa66036d-b63c-4c5a-b3d5-b1d1f80000d',
                resource: createDocumentReference(),
            },
            {
                fullUrl: 'http://fhir-api-auth.public.webmedepj.no/OperationOutcome/Warning',
                resource: {
                    resourceType: 'OperationOutcome',
                    id: 'Warning',
                    issue: [
                        {
                            severity: 'warning',
                            code: 'not-supported',
                            details: {
                                text: 'parameter (type, urn:oid:2.16.578.1.12.4.1.1.9602|J01-2) is not supported',
                            },
                        },
                    ],
                    meta: {
                        lastUpdated: '2025-04-22T13:06:41.3185251+00:00',
                        versionId: '1',
                    },
                },
                search: {
                    mode: 'match',
                },
            },
        ],
    })
}
