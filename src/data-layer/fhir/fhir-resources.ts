import { logger } from '@navikt/next-logger'

import { pathWithBasePath } from '@utils/url'
import { NySykmeldingSchema } from '@services/syk-inn-api/SykInnApiSchema'
import {
    Konsultasjon,
    KonsultasjonSchema,
    Pasient,
    PasientSchema,
    PersonQueryInfoSchema,
    SykmeldingSchema,
    SynchronizationStatusSchema,
} from '@data-layer/resources'
import { wait } from '@utils/wait'

/**
 * Functions to access the generic resources from the FHIR-implementation.
 *
 * None of these resources are directly related to FHIR, any FHIR-specific implementation is in each
 * route handler.
 */
export const fhirResources = {
    queryPerson: async (ident: string) => {
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
    getPasient: async (): Promise<Pasient> => {
        await wait()

        const result = await getSecuredResource('/context/pasient', {
            method: 'GET',
        })
        const parsed = PasientSchema.safeParse(result)
        if (!parsed.success) {
            logger.error('Failed to parse pasient', parsed.error)
            throw parsed.error
        }

        return parsed.data
    },
    getKonsultasjon: async (): Promise<Konsultasjon> => {
        await wait()

        const result = await getSecuredResource('/context/konsultasjon', {
            method: 'GET',
        })
        const parsed = KonsultasjonSchema.safeParse(result)
        if (!parsed.success) {
            logger.error('Failed to parse konsultasjon', parsed.error)
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
