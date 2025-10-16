import { FhirOrganization } from '@navikt/smart-on-fhir/zod'

export type MockOrganizations = 'Magnar Legekontor' | 'Manglerud'

export const createOrganizationMagmarLegekontor = (): FhirOrganization => ({
    resourceType: 'Organization',
    id: crypto.randomUUID(),
    identifier: [
        {
            system: 'urn:oid:2.16.578.1.12.4.1.4.101',
            value: '123456789',
        },
    ],
    name: 'Magnar Klinikk AS',
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

export const createOrganizationManglerud = (): FhirOrganization => ({
    resourceType: 'Organization',
    id: crypto.randomUUID(),
    identifier: [
        {
            system: 'urn:oid:2.16.578.1.12.4.1.4.101',
            value: '999',
        },
    ],
    name: 'Manglerud Vask & Legehjelp AS',
    telecom: [
        {
            system: 'email',
            value: 'mangleru-lege@example.com',
        },
    ],
})
