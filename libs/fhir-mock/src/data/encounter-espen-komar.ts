export const encounterEspenKomar = {
    resourceType: 'Encounter',
    id: '320fd29a-31b9-4c9f-963c-c6c88332d89a',
    identifier: [
        {
            use: 'temp',
            value: 'Encounter/320fd29a-31b9-4c9f-963c-c6c88332d89a',
        },
    ],
    status: 'in-progress',
    class: {
        system: 'http://terminology.hl7.org/CodeSystem/v3-ActCode',
        code: 'NONAC',
        display: 'inpatient non-acute',
    },
    reasonCode: [
        {
            coding: [
                {
                    system: 'urn:oid:2.16.578.1.12.4.1.1.7170',
                    display: 'Angstlidelse',
                    code: 'P74',
                },
            ],
        },
    ],
    diagnosis: [
        {
            condition: {
                type: 'Condition',
                reference: 'Condition/ff0dba18-b879-4fd2-b047-15f58f21696e',
            },
            rank: 1,
        },
        {
            condition: {
                type: 'Condition',
                reference: 'Condition/cbc02cc5-ca4a-4802-982c-31745d86dafc',
            },
            rank: 2,
        },
        {
            condition: {
                type: 'Condition',
                reference: 'Condition/3473fdfa-7182-4f9d-ae3d-a8a967658a35',
            },
            rank: 3,
        },
    ],
    subject: {
        reference: 'Patient/cd09f5d4-55f7-4a24-a25d-a5b65c7a8805',
        display: 'Espen Eksempel',
    },
    participant: [
        {
            individual: {
                reference: 'Practitioner/a1f1ed62-066a-4050-90f7-81e8f62eb3c2',
            },
        },
    ],
    serviceProvider: {
        reference: 'Organization/TODO',
    },
}
