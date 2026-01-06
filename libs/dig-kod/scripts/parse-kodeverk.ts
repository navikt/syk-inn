/* eslint-disable no-console */

import { join } from 'path'
import { writeFileSync } from 'fs'
import { readFile } from 'node:fs/promises'

import * as R from 'remeda'

async function parseICPC2(): Promise<void> {
    console.info('Parsing ICPC-2(B) kodeverk')

    const rawIcpc2 = await readFile('./scripts/raw/icpc2.json', 'utf-8')
        .catch(() => {
            console.error('\x1b[31m\n    ↳ Unable to find ./scripts/raw/icpc2.json. Run yarn kote:get first.\x1b[0m')
            process.exit(1)
        })
        .then(JSON.parse)

    const OUTPUT_PATH_ICPC2B = join('src', 'data', 'icpc2b.json')
    const OUTPUT_PATH_ICPC2 = join('src', 'data', 'icpc2.json')

    type KoteEntry = {
        Kode: string
        Tekst_uten_lengdebegrensning: string
        Gyldig_fra: string
        Kodeverk: string
        Tilhørighet_i_ICPC_2B: string
        Foreldrekode: string
        Foreldrekodetekst: string
    }

    const icpc2 = R.pipe(
        rawIcpc2 as KoteEntry[],
        R.groupBy((it) => it.Kodeverk),
        R.prop('ICPC-2B'),
        // "Root" ICDC-2 nodes are the only one that have Tilhørighet_i_ICPC_2B === 'ICPC-2'
        R.filter((it) => it['Tilhørighet_i_ICPC_2B'] === 'ICPC-2'),
        R.map((it) => ({
            code: it.Foreldrekode,
            text: it.Foreldrekodetekst,
            system: 'ICPC2',
        })),
    )

    console.log(`    ↳ Writing ${icpc2.length} ICPC-2 codes to ${OUTPUT_PATH_ICPC2}`)
    writeFileSync(OUTPUT_PATH_ICPC2, JSON.stringify(icpc2, null, 2), 'utf-8')

    const icpc2b = R.pipe(
        rawIcpc2 as KoteEntry[],
        R.groupBy((it) => it.Kodeverk),
        R.prop('ICPC-2B'),
        // "Sub-terms" in ICDC-2B has the value TERM, there are also ICD-10 nodes, we don't want these (probably).
        R.filter((it) => it['Tilhørighet_i_ICPC_2B'] === 'TERM'),
        R.map((it) => ({
            code: it.Kode,
            text: it.Tekst_uten_lengdebegrensning,
            parent_code: it.Foreldrekode,
            parent_text: it.Foreldrekodetekst,
            system: 'ICPC2B',
        })),
    )

    console.log(`    ↳ Writing ${icpc2b.length} ICPC-2B codes to ${OUTPUT_PATH_ICPC2B}`)
    writeFileSync(OUTPUT_PATH_ICPC2B, JSON.stringify(icpc2b, null, 2), 'utf-8')
}

async function parseICD10(): Promise<void> {
    console.info('Parsing ICD10 kodeverk')

    const rawIcd10 = await readFile('./scripts/raw/icd10.json', 'utf-8')
        .catch(() => {
            console.error('\x1b[31m\n    ↳ Unable to find ./scripts/raw/icd10.json. Run yarn kote:get first.\x1b[0m')
            process.exit(1)
        })
        .then(JSON.parse)

    const OUTPUT_PATH_ICD10 = join('src', 'data', 'icd10.json')

    type KoteEntry = {
        Kode: string
        Tekst_uten_lengdebegrensning: string
        Tekst_med_maksimalt_60_tegn?: string
        Gyldig_fra: string
        Gyldig_til?: string
        Rapporteres_til_NPR?: string
        NPR_Gyldig_fra?: string
        NPR_Gyldig_til?: string
        Stjernekode?: string
        Tilleggskode?: string
        Kjønn?: string
        Uspesifikk_kode?: string
        Foreldrekode?: string
        Foreldrekodetekst?: string
    }

    const icd10 = R.pipe(
        rawIcd10 as KoteEntry[],
        R.filter((it) => it.Rapporteres_til_NPR == 'Ja'),
        R.map((it) => ({
            code: it.Kode,
            text: it.Tekst_uten_lengdebegrensning,
            system: 'ICD10',
        })),
    )

    console.log(`    ↳ Writing ${icd10.length} ICD-10 codes to ${OUTPUT_PATH_ICD10}`)
    writeFileSync(OUTPUT_PATH_ICD10, JSON.stringify(icd10, null, 2), 'utf-8')
}

await parseICD10()
await parseICPC2()
