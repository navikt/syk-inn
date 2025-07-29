import * as R from 'remeda'
import { logger } from '@navikt/next-logger'
import { CodeableConcept, FhirCondition } from '@navikt/smart-on-fhir/zod'

import { Diagnose } from '@resolvers'
import { raise } from '@lib/ts'
import { DiagnoseSystem, ICD10_OID_VALUE, ICPC2_OID_VALUE } from '@data-layer/common/diagnose'

type Diagnosis = {
    system: 'ICD10' | 'ICPC2'
    code: string
    display: string
    rank?: number
}

function getDiagnosis(diagnosis: CodeableConcept[]): Diagnosis | null {
    const relevantDiagnosis = diagnosis.find(
        (it) => it.system.startsWith('urn:oid') && diagnosisUrnToOidType(it.system) != null,
    )

    if (relevantDiagnosis == null) {
        return null
    }

    return {
        ...relevantDiagnosis,
        system: diagnosisUrnToOidType(relevantDiagnosis.system) ?? raise('Unknown diagnosis system'),
    }
}

export function fhirDiagnosisToRelevantDiagnosis(conditions: FhirCondition[] | null): Diagnose[] {
    const [relevanteDignoser, irrelevanteDiagnoser] = conditions
        ? R.partition(conditions, (diagnosis) =>
              diagnosis.code.coding.some((coding) => diagnosisUrnToOidType(coding.system) != null),
          )
        : [[], []]

    logger.info(
        `Fant ${relevanteDignoser.length} med gyldig ICPC-2 eller ICD-10 kode, ${irrelevanteDiagnoser.length} uten gyldig kode`,
    )

    return R.pipe(
        relevanteDignoser,
        R.map((diagnosis) => getDiagnosis(diagnosis.code.coding)),
        R.filter(R.isTruthy),
        R.map(
            (it) =>
                ({
                    system: it.system,
                    code: it.code,
                    text: it.display,
                }) satisfies Diagnose,
        ),
    )
}

function diagnosisUrnToOidType(urn: string): DiagnoseSystem | null {
    switch (urn.replace('urn:oid:', '')) {
        case ICPC2_OID_VALUE:
            return 'ICPC2'
        case ICD10_OID_VALUE:
            return 'ICD10'
        default:
            return null
    }
}
