import * as R from 'remeda'
import { logger } from '@navikt/next-logger'
import { CodeableConcept, FhirCondition } from '@navikt/smart-on-fhir/zod'
import { getICPC2 } from '@navikt/tsm-diagnoser/ICPC2'
import { getICD10 } from '@navikt/tsm-diagnoser/ICD10'
import { getICPC2B } from '@navikt/tsm-diagnoser/ICPC2B'
import Fuse from 'fuse.js'

import { DiagnoseSystem, ICD10_OID_VALUE, ICPC2_OID_VALUE, ICPC2B_OID_VALUE } from '@data-layer/common/diagnose'
import { raise } from '@lib/ts'
import { Diagnose } from '@resolvers'

type Diagnosis = {
    system: 'ICD10' | 'ICPC2' | 'ICPC2B'
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
        R.tap(logDiagnoseDifferences),
    )
}

function diagnosisUrnToOidType(urn: string): DiagnoseSystem | null {
    switch (urn.replace('urn:oid:', '')) {
        case ICPC2_OID_VALUE:
            return 'ICPC2'
        case ICPC2B_OID_VALUE:
            return 'ICPC2B'
        case ICD10_OID_VALUE:
            return 'ICD10'
        default:
            return null
    }
}

/**
 * Temporary log based analysis of differences between FHIR diagnosis texts and the actual texts
 */
function logDiagnoseDifferences(diagnosis: Diagnose[]): void {
    const fuse = new Fuse<string>([], {
        includeScore: true,
        ignoreLocation: true,
        isCaseSensitive: true,
        threshold: 1,
    })

    function normalizeText(text: string): string {
        return text.toLowerCase().split(' ').sort().join(' ')
    }

    for (const it of diagnosis) {
        const actual =
            it.system === 'ICPC2' ? getICPC2(it.code) : it.system === 'ICPC2B' ? getICPC2B(it.code) : getICD10(it.code)

        fuse.setCollection([normalizeText(actual?.text ?? '')])
        const [comparison] = fuse.search(normalizeText(it.text))

        if (comparison == null || comparison.score == null) {
            logger.warn(`[Diagnoseanalyse]: Ugyldig diagnose - ${it.system}:${it.code}:${it.text}`)
        } else if (comparison.score > 0.1) {
            logger.warn(
                `[Diagnoseanalyse]: Stor diff - ${it.system}:${it.code}:${it.text}:${actual?.text}:${comparison.score.toFixed(2)}`,
            )
        }
    }
}
