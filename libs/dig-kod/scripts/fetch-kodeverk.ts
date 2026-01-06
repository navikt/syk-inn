/* eslint-disable no-console */

import { writeFileSync } from 'fs'
import { join } from 'path'

const KODEVERK_ICPC2_URL = 'https://fat.kote.helsedirektoratet.no/api/code-systems/ICPC2/download/JSON'
const KODEVERK_ICD10_URL = 'https://fat.kote.helsedirektoratet.no/api/code-systems/ICD10/download/JSON'

const OUTPUT_PATH_ICPC2 = join('scripts', 'raw', 'icpc2.json')
const OUTPUT_PATH_ICD10 = join('scripts', 'raw', 'icd10.json')

async function fetchAndWrite(url: string, outputPath: string): Promise<void> {
    const response = await fetch(url)

    if (!response.ok) {
        throw new Error(`   ↳ Failed to fetch kodeverk: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()

    console.info(`    ↳ Writing kodeverk to ${outputPath}`)
    writeFileSync(outputPath, JSON.stringify(data, null, 2), 'utf-8')
}

console.info(`Fetching ICPC-2(B) kodeverk from ${KODEVERK_ICPC2_URL}`)
await fetchAndWrite(KODEVERK_ICPC2_URL, OUTPUT_PATH_ICPC2)

console.info(`Fetching ICD10 kodeverk from ${KODEVERK_ICD10_URL}`)
await fetchAndWrite(KODEVERK_ICD10_URL, OUTPUT_PATH_ICD10)
