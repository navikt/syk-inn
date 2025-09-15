import { CodeableConcept, FhirCondition, FhirPatient } from '@navikt/smart-on-fhir/zod'

import { Patients } from './patients'

function createCondition(patientId: string, encounterId: string, coding: CodeableConcept): FhirCondition {
    return {
        resourceType: 'Condition',
        id: crypto.randomUUID(),
        subject: { reference: `Patient/${patientId}` },
        encounter: { reference: `Encounter/${encounterId}` },
        code: {
            coding: [coding],
        },
    }
}

export const codingBruddLeggAnkel = {
    system: 'urn:oid:2.16.578.1.12.4.1.1.7170',
    display: 'Brudd legg/ankel',
    code: 'L73',
}

export const codingAngstlidelse = {
    system: 'urn:oid:2.16.578.1.12.4.1.1.7170',
    display: 'Angstlidelse',
    code: 'P74',
}

export const codingBotulisme = {
    system: 'urn:oid:2.16.578.1.12.4.1.1.7110',
    display: 'Botulisme',
    code: 'A051',
}

export function getConditionsFor(patientName: Patients, encounterId: string, patient: FhirPatient): FhirCondition[] {
    switch (patientName) {
        case 'Kari Normann':
            return [createCondition(patient.id, encounterId, codingBotulisme)]
        case 'Espen Eksempel':
            return [
                createCondition(patient.id, encounterId, codingBruddLeggAnkel),
                createCondition(patient.id, encounterId, codingAngstlidelse),
                createCondition(patient.id, encounterId, codingBotulisme),
            ]
    }
}
