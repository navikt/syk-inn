import { FhirPatient } from '@navikt/smart-on-fhir/zod'

export type MockPatients = 'Espen Eksempel' | 'Kari Normann'

export const createPatientEspenEksempel = (): FhirPatient => ({
    resourceType: 'Patient',
    id: crypto.randomUUID(),
    meta: { profile: ['http://hl7.no/fhir/StructureDefinition/no-basis-Patient'] },
    identifier: [{ system: 'urn:oid:2.16.578.1.12.4.1.4.1', value: '21037712323' }],
    name: [{ family: 'Eksempel', given: ['Espen'] }],
    generalPractitioner: [
        {
            identifier: {
                system: 'urn:oid:2.16.578.1.12.4.1.4.4',
                value: '720123123',
            },
            display: 'SIDSEL AASE JAVERY',
        },
    ],
})
export const createPatientKariNormann = (): FhirPatient => ({
    resourceType: 'Patient',
    id: crypto.randomUUID(),
    meta: { profile: ['http://hl7.no/fhir/StructureDefinition/no-basis-Patient'] },
    identifier: [{ system: 'urn:oid:2.16.578.1.12.4.1.4.1', value: '45847100951' }],
    name: [{ family: 'Normann', given: ['Kari'] }],
    generalPractitioner: [
        {
            identifier: {
                system: 'urn:oid:2.16.578.1.12.4.1.4.4',
                value: '123812031',
            },
            display: 'LEGE L. LEGESSON',
        },
    ],
})
