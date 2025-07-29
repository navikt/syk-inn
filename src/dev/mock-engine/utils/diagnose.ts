import { DiagnoseFragment } from '@queries'
import { DiagnoseSystem } from '@data-layer/common/diagnose'
import { getDiagnoseText } from '@data-layer/common/diagnose-search'

export function addDiagnoseText(
    diagnose: { system: DiagnoseSystem; code: string } | null,
): Omit<DiagnoseFragment, '__typename'> | null {
    if (diagnose == null) return null

    return {
        ...diagnose,
        text: getDiagnoseText(diagnose.system, diagnose.code),
    }
}
