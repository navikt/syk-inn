import { FhirBundle, FhirCondition } from '@navikt/fhir-zod'
import { logger } from '@navikt/pino-logger'

const conditions: FhirCondition[] = [
    {
        resourceType: 'Condition',
        id: 'ff0dba18-b879-4fd2-b047-15f58f21696e',
        subject: {
            reference: 'Patient/cd09f5d4-55f7-4a24-a25d-a5b65c7a8805',
        },
        encounter: {
            reference: 'Encounter/320fd29a-31b9-4c9f-963c-c6c88332d89a',
        },
        code: {
            coding: [
                {
                    system: 'urn:oid:2.16.578.1.12.4.1.1.7170',
                    display: 'Brudd legg/ankel',
                    code: 'L73',
                },
            ],
        },
    } satisfies FhirCondition,
    {
        resourceType: 'Condition',
        id: 'cbc02cc5-ca4a-4802-982c-31745d86dafc',
        subject: {
            reference: 'Patient/cd09f5d4-55f7-4a24-a25d-a5b65c7a8805',
        },
        encounter: {
            reference: 'Encounter/320fd29a-31b9-4c9f-963c-c6c88332d89a',
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
            reference: 'Patient/cd09f5d4-55f7-4a24-a25d-a5b65c7a8805',
        },
        encounter: {
            reference: 'Encounter/320fd29a-31b9-4c9f-963c-c6c88332d89a',
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

export function getConditionsByEncounterId(encounterId: string): FhirBundle<FhirCondition> | null {
    const relevantConditions = conditions.filter((it) => it.encounter.reference === `Encounter/${encounterId}`)

    return {
        resourceType: 'Bundle',
        type: 'searchset',
        entry: relevantConditions.map((condition) => ({
            resource: condition,
        })),
    }
}
