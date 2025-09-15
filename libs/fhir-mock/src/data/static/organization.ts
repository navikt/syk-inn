import { FhirOrganization } from '@navikt/smart-on-fhir/zod'

export const createOrganizationMagmarLegekontor = (): FhirOrganization => ({
    resourceType: 'Organization',
    id: crypto.randomUUID(),
    identifier: [
        {
            system: 'urn:oid:2.16.578.1.12.4.1.4.101',
            value: '123456789',
        },
    ],
    name: 'Manglerud Vask & Legehjelp AS',
    telecom: [
        {
            system: 'phone',
            value: '12345678',
        },
        {
            system: 'email',
            value: 'mangleru-lege@example.com',
        },
    ],
})
