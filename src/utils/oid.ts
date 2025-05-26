export type ICD10_OID = typeof ICD10_OID_VALUE
export const ICD10_OID_VALUE = '2.16.578.1.12.4.1.1.7170'

export type ICPC2_OID = typeof ICPC2_OID_VALUE
export const ICPC2_OID_VALUE = '2.16.578.1.12.4.1.1.7171'

export type SupportedDiagnoseSystemsShorthand = 'ICD10' | 'ICPC2'

export function diagnoseSystemToOid(system: SupportedDiagnoseSystemsShorthand): ICPC2_OID | ICD10_OID {
    switch (system) {
        case 'ICD10':
            return ICD10_OID_VALUE
        case 'ICPC2':
            return ICPC2_OID_VALUE
        default:
            throw new Error(`Unsupported diagnose system: ${system}`)
    }
}
