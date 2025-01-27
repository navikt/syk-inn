import { logger } from '@navikt/next-logger'

import { FhirCondition } from '@fhir/fhir-data/schema/condition'

const conditions: FhirCondition[] = [
    {
        resourceType: 'Condition',
        id: 'cbc02cc5-ca4a-4802-982c-31745d86dafc',
        subject: {
            type: 'Patient',
            reference: 'Patient/cd09f5d4-55f7-4a24-a25d-a5b65c7a8805',
        },
        code: {
            coding: [
                {
                    system: 'urn:oid:2.16.578.1.12.4.1.1.7170',
                    display: 'Angstlidelse',
                    code: 'P74',
                },
            ],
        },
    } satisfies FhirCondition,
    {
        resourceType: 'Condition',
        id: '3473fdfa-7182-4f9d-ae3d-a8a967658a35',
        subject: {
            type: 'Patient',
            reference: 'Patient/cd09f5d4-55f7-4a24-a25d-a5b65c7a8805',
        },
        code: {
            coding: [
                {
                    system: 'urn:oid:2.16.578.1.12.4.1.1.7110',
                    display: 'Botulisme',
                    code: 'A051',
                },
            ],
        },
    } satisfies FhirCondition,
]

export function getConditionById(id: string): FhirCondition | null {
    const condition = conditions.find((it) => it.id === id)
    if (condition == null) {
        logger.warn(`Unable to find condition by id ${id}`)
        return null
    }

    return condition
}

export function getConditionsByPatientId(patientId: string): FhirCondition[] | null {
    return conditions.filter((it) => it.subject.reference === `Patient/${patientId}`)
}
