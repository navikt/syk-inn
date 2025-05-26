import { logger } from '@navikt/next-logger'

import { raise } from '@utils/ts'
import { wait } from '@utils/wait'
import { pathWithBasePath } from '@utils/url'
import { FhirBundleOrPatientSchema } from '@navikt/fhir-zod'
import { getFastlege, getName, getValidPatientIdent } from '@fhir/fhir-data/mappers/patient'
import { PasientInfo } from '@data-layer/data-fetcher/data-service'
import { Konsultasjon, KonsultasjonSchema } from '@data-layer/data-fetcher/resources'

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
    getFhirKonsultasjon: async (): Promise<Konsultasjon> => {
        const result = await getSecuredResource('/context/konsultasjon')
        const parsed = KonsultasjonSchema.safeParse(result)
        if (!parsed.success) {
            logger.error('Failed to parse konsultasjon', parsed.error)
            throw parsed.error
        }

        return parsed.data
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
