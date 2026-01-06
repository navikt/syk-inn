import icpc2b from './data/icpc2b.json' with { type: 'json' }
import icpc2 from './data/icpc2.json' with { type: 'json' }
import icd10 from './data/icd10.json' with { type: 'json' }

type BaseEntry = {
    code: string
    text: string
}

type ICPC2BEntry = BaseEntry & {
    system: 'ICPC2B'
    parent_code: string
    parent_text: string
}

type ICPC2Entry = BaseEntry & {
    system: 'ICPC2'
}

type ICD10Entry = BaseEntry & {
    system: 'ICD10'
}

export const ICPC2B = icpc2b.map((it) => ({ ...it, system: 'ICPC2B' })) satisfies ICPC2BEntry[]

export const ICPC2 = icpc2.map((it) => ({ ...it, system: 'ICPC2' })) satisfies ICPC2Entry[]

export const ICD10 = icd10.map((it) => ({ ...it, system: 'ICD10' })) satisfies ICD10Entry[]
