import {
    FhirCondition,
    FhirEncounter,
    FhirOrganization,
    FhirPatient,
    FhirPractitioner,
} from '@navikt/smart-on-fhir/zod'

import { getConditionsFor } from './condition'
import { createEncounter } from './encounter'
import { MockPatients } from './patients'

/**
 * A holder for any resources, from the perspective of a patient.
 *
 * This structure does NOT support multiple practitioners, this is a "one practitioner" to many patients model.
 */
export type PatientSession = {
    encounter: FhirEncounter
    patient: FhirPatient
    conditions: FhirCondition[]
    practitioner: FhirPractitioner
    organization: FhirOrganization
}

export function createPatientSession(
    patientName: MockPatients,
    patient: FhirPatient,
    practitioner: FhirPractitioner,
    organization: FhirOrganization,
): PatientSession {
    const encounterId = crypto.randomUUID()

    const conditions = getConditionsFor(patientName, encounterId, patient)
    const encounter = createEncounter(encounterId, patient, conditions, practitioner, organization)

    return {
        encounter: encounter,
        patient: patient,
        conditions: conditions,
        practitioner: practitioner,
        organization: organization,
    }
}
