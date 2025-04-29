import { logger } from '@navikt/next-logger'
import * as R from 'remeda'

import { raise } from '@utils/ts'
import { wait } from '@utils/wait'
import { pathWithBasePath } from '@utils/url'
import {
    createFhirBundleSchema,
    FhirBundleOrPatientSchema,
    FhirConditionSchema,
    FhirEncounterSchema,
} from '@navikt/fhir-zod'
import { getFastlege, getName, getValidPatientIdent } from '@fhir/fhir-data/mappers/patient'
import { diagnosisUrnToOidType, getDiagnosis } from '@fhir/fhir-data/mappers/diagnosis'

import { PasientInfo } from '../../data-fetcher/data-service'

/**
 * These are FHIR resources available in the browser runtime. All of these resources are proxied
 * through the backend, but the schema is validated in the browser.
 */
export const fhirResources = {
    getFhirPatient: async (): Promise<PasientInfo> => {
        await wait()

        // TODO: Bedre feilhåndtering
        const patient: unknown = await getSecuredResource('/context/Patient')
        const parsed = FhirBundleOrPatientSchema.safeParse(patient)

        if (!parsed.success) {
            logger.error('Failed to parse patient', parsed.error)
            throw parsed.error
        }

        if (parsed.data.resourceType === 'Bundle') {
            raise("We don't support bundles haha")
        }

        return {
            navn: getName(parsed.data.name),
            ident: getValidPatientIdent(parsed.data) ?? raise('Patient without valid FNR/DNR'),
            fastlege: getFastlege(parsed.data),
        }
    },
    getFhirKonsultasjon: async () => {
        const patientConditionBundle: unknown = await getSecuredResource(`/context/Conditions`)
        const parsedConditionBundle = createFhirBundleSchema(FhirConditionSchema).safeParse(patientConditionBundle)

        const encounter: unknown = await getSecuredResource(`/context/Encounter`)
        const parsedEncounter = FhirEncounterSchema.safeParse(encounter)

        if (!parsedConditionBundle.success) {
            logger.error('Failed to parse conditions', parsedConditionBundle.error)
            throw parsedConditionBundle.error
        }

        const conditionList = parsedConditionBundle.data?.entry.map((it) => it.resource)

        const [relevanteDignoser, irrelevanteDiagnoser] = conditionList
            ? R.partition(conditionList, (diagnosis) =>
                  diagnosis.code.coding.some((coding) => diagnosisUrnToOidType(coding.system) != null),
              )
            : [[], []]

        logger.info(
            `Fant ${relevanteDignoser.length} med gyldig ICPC-2 eller ICD-10 kode, ${irrelevanteDiagnoser.length} uten gyldig kode`,
        )

        const fhirDiagnose = parsedEncounter.data?.reasonCode
            ? getDiagnosis(parsedEncounter.data.reasonCode[0].coding)
            : null

        return {
            diagnoser: R.pipe(
                relevanteDignoser,
                R.map((diagnosis) => getDiagnosis(diagnosis.code.coding)),
                R.filter(R.isTruthy),
                R.map((it) => ({
                    system: it.system,
                    kode: it.code,
                    tekst: it.display,
                })),
            ),
            diagnose: fhirDiagnose
                ? {
                      system: fhirDiagnose.system,
                      kode: fhirDiagnose.code,
                      tekst: fhirDiagnose.display,
                  }
                : null,
        }
    },
}

async function getSecuredResource(path: `/${string}`): Promise<unknown> {
    const response = await fetch(pathWithBasePath(`/fhir/resources${path}`))
    if (!response.ok) {
        logger.error(`Secured Resource ${path} failed with ${response.status} ${response.statusText}`)
        throw new Error(`Failed to fetch secured resource ${path}`)
    }

    return response.json()
}
