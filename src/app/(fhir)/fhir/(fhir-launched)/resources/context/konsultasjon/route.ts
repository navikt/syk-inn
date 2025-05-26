import * as R from 'remeda'
import { logger } from '@navikt/next-logger'

import { getReadyClient } from '@data-layer/fhir/smart-client'
import { konsultasjonRoute } from '@data-layer/api-routes/route-handlers'
import { diagnosisUrnToOidType, getDiagnosis } from '@data-layer/fhir/mappers/diagnosis'

export const GET = konsultasjonRoute(async () => {
    const client = await getReadyClient({ validate: true })
    if ('error' in client) {
        return { error: 'AUTH_ERROR' }
    }

    const conditionsByEncounter = await client.request(`/Condition?encounter=${client.encounter}`)
    if ('error' in conditionsByEncounter) {
        return { error: 'PARSING_ERROR' }
    }

    const conditionList = conditionsByEncounter.entry.map((it) => it.resource)
    const [relevanteDignoser, irrelevanteDiagnoser] = conditionList
        ? R.partition(conditionList, (diagnosis) =>
              diagnosis.code.coding.some((coding) => diagnosisUrnToOidType(coding.system) != null),
          )
        : [[], []]

    logger.info(
        `Fant ${relevanteDignoser.length} med gyldig ICPC-2 eller ICD-10 kode, ${irrelevanteDiagnoser.length} uten gyldig kode`,
    )

    return {
        diagnoser: R.pipe(
            relevanteDignoser,
            R.map((diagnosis) => getDiagnosis(diagnosis.code.coding)),
            R.filter(R.isTruthy),
            R.map((it) => ({
                system: it.system,
                code: it.code,
                text: it.display,
            })),
        ),
    }
})
