import { logger } from '@navikt/next-logger'

import { wait } from '@utils/wait'
import { pathWithBasePath } from '@utils/url'
import { Konsultasjon, KonsultasjonSchema, PasientInfo, PasientInfoSchema } from '@data-layer/resources'

/**
 * These are FHIR resources available in the browser runtime. All of these resources are proxied
 * through the backend, but the schema is validated in the browser.
 */
export const fhirResources = {
    getFhirPatient: async (): Promise<PasientInfo> => {
        await wait()

        const result = await getSecuredResource('/context/pasient')
        const parsed = PasientInfoSchema.safeParse(result)
        if (!parsed.success) {
            logger.error('Failed to parse pasient', parsed.error)
            throw parsed.error
        }

        return parsed.data
    },
    getFhirKonsultasjon: async (): Promise<Konsultasjon> => {
        await wait()

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
