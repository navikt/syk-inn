import { logger } from '@navikt/next-logger'

import { pathWithBasePath } from '@utils/url'
import { NySykmeldingSchema } from '@services/syk-inn-api/SykInnApiSchema'
import { PersonQueryInfoSchema, SykmeldingSchema } from '@data-layer/resources'

import { WriteToEhrResult } from '../data-fetcher/data-service'

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

        return {
            navn: parsed.data.navn,
            ident: parsed.data.ident,
        }
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
    sendSykmelding: async (values: unknown, hpr: string) => {
        const result = await getSecuredResource(`/sykmelding/submit`, {
            method: 'POST',
            body: JSON.stringify({
                values,
                // TODO: Use session probably
                behandlerHpr: hpr,
            }),
        })

        const parsed = NySykmeldingSchema.safeParse(result)
        if (!parsed.success) {
            logger.error('Failed to parse nySykmelding', parsed.error)
            throw parsed.error
        }

        return parsed.data
    },
    writeToEhr: async (sykmeldingId: string, hpr: string): Promise<WriteToEhrResult> => {
        const result = await getSecuredResource(`/sykmelding/write-to-ehr`, {
            method: 'POST',
            headers: {
                sykmeldingId: sykmeldingId, //TODO move to body
                HPR: hpr,
            },
        })

        // TODO: Better error handling
        return result as WriteToEhrResult // todo actually illegal
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
