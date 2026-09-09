import { KnownFhirServer } from '@navikt/smart-on-fhir/client'
import * as z from 'zod'

import { getServerEnv } from '#lib/env'

type FhirConfigurationDev = z.infer<typeof FhirConfigurationDevSchema>
const FhirConfigurationDevSchema = z.object({
    webmedClientSecret: z.string(),
    joviaHelseSecret: z.string(),
    navEpjClientSecret: z.string(),
})

export const getDevFhirConfiguration = (): FhirConfigurationDev =>
    FhirConfigurationDevSchema.parse({
        webmedClientSecret: process.env.WEBMED_CLIENT_SECRET,
        joviaHelseSecret: process.env.JOVIA_HELSE_CLIENT_SECRET,
        navEpjClientSecret: process.env.NAV_EPJ_CLIENT_SECRET,
    } satisfies Record<keyof FhirConfigurationDev, unknown>)

export function getKnownDevFhirServers(): KnownFhirServer[] {
    const env = getServerEnv() //  Use env.fhir.privateJwk for any confidential-asymmetric private_key_jwk clients
    const configuration = getDevFhirConfiguration()

    return [
        {
            name: 'WebMed (test)',
            issuer: 'https://fhir-api-auth.public.webmedepj.no',
            type: 'confidential-symmetric',
            method: 'client_secret_basic',
            clientSecret: configuration.webmedClientSecret,
        },
        {
            name: 'Jovia Helse (test)',
            issuer: 'https://joviahelse.no/journal/fhir/r4',
            type: 'confidential-symmetric',
            method: 'client_secret_basic',
            clientSecret: configuration.joviaHelseSecret,
        },
        {
            name: 'Medro (test)',
            issuer: 'https://dev.medro.no/api/fhir',
            type: 'confidential-asymmetric',
            method: 'private_key_jwt',
            privateKey: env.fhir.privateJwk,
        },
        {
            name: 'nav-epj',
            issuer: 'https://epj.ekstern.dev.nav.no/fhir',
            type: 'confidential-symmetric',
            method: 'client_secret_basic',
            clientSecret: configuration.navEpjClientSecret,
        },
    ]
}
