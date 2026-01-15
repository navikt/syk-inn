import { expect, test } from 'vitest'
import { FhirCondition } from '@navikt/smart-on-fhir/zod'

import { fhirDiagnosisToRelevantDiagnosis } from '@data-layer/fhir/mappers/diagnosis'
import { ICPC2_OID_VALUE } from '@data-layer/common/diagnose'

test('diagnose differ analyisis: should log and match ICPC2B', () => {
    // Based on IRL log cose: [Diagnoseanalyse]: Stor diff - ICPC2:L03:Lumbal ryggsmerte:Korsrygg symptomer/plager:0.78

    const result = fhirDiagnosisToRelevantDiagnosis([
        {
            resourceType: 'Condition',
            id: 'example',
            code: {
                coding: [
                    {
                        system: `urn:oid:${ICPC2_OID_VALUE}`,
                        code: 'L03',
                        display: 'Lumbal ryggsmerte',
                    },
                ],
            },
            encounter: { reference: 'Encounter/example' },
            subject: { reference: 'Patient/example' },
        } satisfies FhirCondition,
    ])

    expect(result[0]).toEqual({
        system: 'ICPC2',
        code: 'L03',
        text: 'Lumbal ryggsmerte',
    })
})
