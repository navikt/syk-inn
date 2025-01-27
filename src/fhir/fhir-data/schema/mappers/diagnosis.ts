import { CodeableConcept } from '@fhir/fhir-data/schema/common'
import { raise } from '@utils/ts'

const ICDC2_OID = '2.16.578.1.12.4.1.1.7170'
const ICD10_OID = '2.16.578.1.12.4.1.1.7110'

export function diagnosisUrnToOidType(urn: string): 'ICD10' | 'ICPC2' | null {
    switch (urn.replace('urn:oid:', '')) {
        case ICDC2_OID:
            return 'ICPC2'
        case ICD10_OID:
            return 'ICD10'
        default:
            return null
    }
}

type Diagnosis = {
    system: 'ICD10' | 'ICPC2'
    code: string
    display: string
    rank?: number
}

export function getDiagnosis(diagnosis: CodeableConcept[]): Diagnosis | null {
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
