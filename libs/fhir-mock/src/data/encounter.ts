import {
    FhirCondition,
    FhirEncounter,
    FhirOrganization,
    FhirPatient,
    FhirPractitioner,
} from '@navikt/smart-on-fhir/zod'

export function createEncounter(
    id = crypto.randomUUID(),
    patient: FhirPatient,
    conditions: FhirCondition[],
    practitioner: FhirPractitioner,
    organization: FhirOrganization,
): FhirEncounter {
    return {
        resourceType: 'Encounter',
        id: id,
        status: 'in-progress',
        // This should probably be removed, from earlier PoC-ing
        reasonCode: [
            { coding: [{ system: 'urn:oid:2.16.578.1.12.4.1.1.7170', display: 'Angstlidelse', code: 'P74' }] },
        ],
        diagnosis: conditions.map((it) => ({
            condition: { type: 'Condition', reference: `Condition/${it.id}` },
        })),
        subject: {
            reference: `Patient/${patient.id}`,
        },
        participant: [{ individual: { reference: `Practitioner/${practitioner.id}` } }],
        serviceProvider: {
            reference: `Organization/${organization.id}`,
        },
    }
}
