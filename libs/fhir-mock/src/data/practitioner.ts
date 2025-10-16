import { FhirPractitioner } from '@navikt/smart-on-fhir/zod'

export type MockPractitioners = 'Magnar Koman' | 'Badette Organitto'

export const createPractitionerKomanMagnar = (): FhirPractitioner => ({
    resourceType: 'Practitioner',
    id: crypto.randomUUID(),
    meta: {
        profile: ['http://hl7.no/fhir/StructureDefinition/no-basis-Practitioner'],
    },
    identifier: [{ system: 'urn:oid:2.16.578.1.12.4.1.4.4', value: '9144889' }],
    name: [{ family: 'Koman', given: ['Magnar'] }],
    qualification: [
        {
            code: {
                coding: [
                    { system: 'urn:oid:2.16.578.1.12.4.1.1.9060', code: 'LE', display: 'Lege' },
                    { system: 'urn:oid:2.16.578.1.12.4.1.1.7704', code: '1', display: 'Autorisasjon' },
                    { system: 'urn:oid:2.16.578.1.12.4.1.1.7426', code: '152', display: 'Ortopedisk kirurgi' },
                ],
            },
        },
    ],
})

export const createPractitionerBadetteOrganitto = (): FhirPractitioner => ({
    resourceType: 'Practitioner',
    id: crypto.randomUUID(),
    meta: {
        profile: ['http://hl7.no/fhir/StructureDefinition/no-basis-Practitioner'],
    },
    identifier: [{ system: 'urn:oid:2.16.578.1.12.4.1.4.4', value: '7437869' }],
    name: [{ family: 'Organitto', given: ['Badette'] }],
    qualification: [
        {
            code: {
                coding: [
                    { system: 'urn:oid:2.16.578.1.12.4.1.1.9060', code: 'LE', display: 'Lege' },
                    { system: 'urn:oid:2.16.578.1.12.4.1.1.7704', code: '1', display: 'Autorisasjon' },
                    { system: 'urn:oid:2.16.578.1.12.4.1.1.7426', code: '152', display: 'Ortopedisk kirurgi' },
                ],
            },
        },
    ],
})
