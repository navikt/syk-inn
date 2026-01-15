import Fuse from 'fuse.js'
import { ICD10, ICPC2, ICPC2B } from '@navikt/tsm-diagnoser'

import { raise } from '@lib/ts'
import { Diagnose, DiagnoseSystem } from '@data-layer/common/diagnose'

const icd10Fuse = new Fuse(ICD10, { keys: ['code', 'text', 'system'], threshold: 0.2 })
const icpc2Fuse = new Fuse(ICPC2, { keys: ['code', 'text', 'system'], threshold: 0.2 })
const icpc2bFuse = new Fuse(ICPC2B, { keys: ['code', 'text', 'system', 'parent_code', 'parent_text'], threshold: 0.2 })

export function searchDiagnose(query: string, systems: DiagnoseSystem[]): Diagnose[] {
    const fuseResult = systems
        .map(getSystemFuse)
        .flatMap((it) => it.search(query))
        .map(
            (it) =>
                ({
                    system: it.item.system as DiagnoseSystem,
                    code: it.item.code,
                    text: it.item.text,
                    score: it.score ?? null,
                }) satisfies Diagnose & { score: number | null },
        )
        .slice(0, 100)

    return fuseResult
}

function getSystemFuse(system: DiagnoseSystem): typeof icd10Fuse | typeof icpc2Fuse | typeof icpc2bFuse {
    switch (system) {
        case 'ICD10':
            return icd10Fuse
        case 'ICPC2':
            return icpc2Fuse
        case 'ICPC2B':
            return icpc2bFuse
    }
}

export function getDiagnoseText(system: DiagnoseSystem, code: string): string {
    const diagnose = getSystem(system).find((it) => it.code.replace('.', '') === code)
    if (!diagnose) {
        raise(`No diagnose found in ${system} with code ${code}`)
    }

    return diagnose.text
}

function getSystem(system: DiagnoseSystem): typeof ICD10 | typeof ICPC2 | typeof ICPC2B {
    switch (system) {
        case 'ICD10':
            return ICD10
        case 'ICPC2':
            return ICPC2
        case 'ICPC2B':
            return ICPC2B
    }
}
