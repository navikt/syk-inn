import { logger } from '@navikt/next-logger'

import { pathWithBasePath } from '@utils/url'
import { NySykmeldingSchema } from '@services/syk-inn-api/SykInnApiSchema'
import { PersonQueryInfoSchema, SykmeldingSchema, SynchronizationStatusSchema } from '@data-layer/resources'

/**
 * These are resources that are not FHIR resources, but are available in the browser runtime and proxied
 * through the backend. The schema is validated in the browser.
 *
 * Each of these resources are implemented as their own API route handlers that have access to the current
 * session, and validates the session before returning the resource.
 */
export const nonFhirResources = {
    getPasient: async (ident: string) => {
        const result = await getSecuredResource(`/person`, {
            method: 'GET',
            headers: { Ident: ident },
        })

        const parsed = PersonQueryInfoSchema.safeParse(result)
        if (!parsed.success) {
            logger.error('Failed to parse pasient (query)', parsed.error)
            throw parsed.error
        }

        return parsed.data
    },
    getSykmelding: async (id: string) => {
        const result = await getSecuredResource(`/sykmelding/${id}`, {
            method: 'GET',
        })

        const parsed = SykmeldingSchema.safeParse(result)
        if (!parsed.success) {
            logger.error('Failed to parse sykmelding', parsed.error)
            throw parsed.error
        }

        return parsed.data
    },
    sendSykmelding: async (values: unknown) => {
        const result = await getSecuredResource(`/sykmelding/submit`, {
            method: 'POST',
            body: JSON.stringify({ values }),
        })

        const parsed = NySykmeldingSchema.safeParse(result)
        if (!parsed.success) {
            logger.error('Failed to parse nySykmelding', parsed.error)
            throw parsed.error
        }

        return parsed.data
    },
    synchronizeSykmelding: async (id: string) => {
        const result = await getSecuredResource(`/sykmelding/${id}/synchronize`, {
            method: 'POST',
        })

        const parsed = SynchronizationStatusSchema.safeParse(result)
        if (!parsed.success) {
            logger.error('Failed to parse sykmelding', parsed.error)
            throw parsed.error
        }

        return parsed.data
    },
}

async function getSecuredResource(path: `/${string}`, fetchOptions: RequestInit): Promise<unknown> {
    const response = await fetch(pathWithBasePath(`/fhir/resources${path}`), {
        ...fetchOptions,
        headers: {
            ...fetchOptions.headers,
            'Content-Type': 'application/json',
        },
    })
    if (!response.ok) {
        logger.error(`Secured Resource ${path} failed with ${response.status} ${response.statusText}`)
        throw new Error(`Failed to fetch secured resource ${path}`)
    }

    return response.json()
}
