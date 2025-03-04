import { logger } from '@navikt/next-logger'

import { pathWithBasePath } from '@utils/url'
import { fhirResources } from '@fhir/fhir-data/fhir-data'
import { ExistingSykmeldingSchema, NySykmeldingSchema } from '@services/syk-inn-api/SykInnApiSchema'
import { PdlPersonSchema } from '@services/pdl/PdlApiSchema'
import { getFnrIdent } from '@services/pdl/PdlApiUtils'
import { FhirDocumentReferenceResponseSchema } from '@fhir/fhir-data/schema/documentReference'

/**
 * These are resources that are not FHIR resources, but are available in the browser runtime and proxied
 * through the backend. The schema is validated in the browser.
 *
 * Each of these resources are implemented as their own API route handlers that have access to the current
 * session, and validates the session before returning the resource.
 */
export const nonFhirResources = {
    getTidligereSykmeldinger: async () => {
        const fhirPatient = await fhirResources.getFhirPatient()
        const result = await getSecuredResource('/sykmelding', {
            method: 'GET',
            headers: {
                Ident: fhirPatient.ident,
            },
        })

        // TODO: Better error handling
        return ExistingSykmeldingSchema.array().parse(result)
    },
    getPasient: async (ident: string) => {
        const result = await getSecuredResource(`/person`, {
            method: 'GET',
            headers: {
                Ident: ident,
            },
        })

        // TODO: Better error handling
        const parsed = PdlPersonSchema.parse(result)
        const fnrOrDnr = getFnrIdent(parsed.identer)

        return {
            navn: `${parsed.navn.fornavn}${parsed.navn.mellomnavn ? ` ${parsed.navn.mellomnavn}` : ''} ${parsed.navn.etternavn}`,
            ident: fnrOrDnr,
        }
    },
    getSykmelding: async (id: string, hpr: string) => {
        const result = await getSecuredResource(`/sykmelding/${id}`, {
            method: 'GET',
            headers: {
                // TODO: Use session probably
                HPR: hpr,
            },
        })

        // TODO: Better error handling
        return ExistingSykmeldingSchema.parse(result)
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

        // TODO: Better error handling
        return NySykmeldingSchema.parse(result)
    },

    writeToEhr: async (sykmeldingId: string) => {
        const result = await getSecuredResource(`/sykmelding/write-to-ehr`, {
            method: 'POST',
            headers: {
                sykmeldingId: sykmeldingId,
            },
        })

        return FhirDocumentReferenceResponseSchema.parse(result)
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
