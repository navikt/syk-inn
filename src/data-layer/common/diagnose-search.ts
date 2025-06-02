import { ICD10, ICPC2 } from '@navikt/diagnosekoder'
import Fuse from 'fuse.js'

import { DiagnoseSuggestion, DiagnoseSystem } from '@components/form/diagnose-combobox/DiagnoseCombobox'

const icd10 = ICD10.map((it) => ({ system: 'ICD10', ...it }))
const icpc2 = ICPC2.map((it) => ({ system: 'ICPC2', ...it }))

const megaFuse = new Fuse([...icd10, ...icpc2], { keys: ['code', 'text', 'system'], threshold: 0.2 })

export function searchDiagnose(query: string): DiagnoseSuggestion[] {
    const fuseResult = megaFuse
        .search(query)
        .map(
            (it) =>
                ({
                    system: it.item.system as DiagnoseSystem,
                    code: it.item.code,
                    // text: it.item.text,
                }) satisfies DiagnoseSuggestion,
        )
        .slice(0, 100)

    return fuseResult
}
