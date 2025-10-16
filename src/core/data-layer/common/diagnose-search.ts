import { ICD10, ICPC2 } from '@navikt/diagnosekoder'
import Fuse from 'fuse.js'

import { raise } from '@lib/ts'
import { Diagnose, DiagnoseSystem } from '@data-layer/common/diagnose'

const icd10 = ICD10.map((it) => ({ system: 'ICD10', ...it }))
const icpc2 = ICPC2.map((it) => ({ system: 'ICPC2', ...it }))

const icd10Fuse = new Fuse(icd10, { keys: ['code', 'text', 'system'], threshold: 0.2 })
const icpc2Fuse = new Fuse(icpc2, { keys: ['code', 'text', 'system'], threshold: 0.2 })

export function searchDiagnose(query: string, system: DiagnoseSystem): Diagnose[] {
    const fuseResult = (system === 'ICPC2' ? icd10Fuse : icpc2Fuse)
        .search(query)
        .map(
            (it) =>
                ({
                    system: it.item.system as DiagnoseSystem,
                    code: it.item.code,
                    text: it.item.text,
                }) satisfies Diagnose,
        )
        .slice(0, 100)

    return fuseResult
}

export function getDiagnoseText(system: DiagnoseSystem, code: string): string {
    const diagnoses = system === 'ICD10' ? icd10 : icpc2
    const diagnose = diagnoses.find((it) => it.code === code)

    if (!diagnose) {
        raise(`No diagnose found in ${system} with code ${code}`)
    }

    return diagnose.text
}
