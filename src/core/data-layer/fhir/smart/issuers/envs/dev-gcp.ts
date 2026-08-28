import { KnownFhirServer } from '@navikt/smart-on-fhir/client'
import * as z from 'zod'

type FhirConfigurationDev = z.infer<typeof FhirConfigurationDevSchema>
const FhirConfigurationDevSchema = z.object({
    webmedClientSecret: z.string(),
    navEpjClientSecret: z.string(),
})

export const getDevFhirConfiguration = (): FhirConfigurationDev =>
    FhirConfigurationDevSchema.parse({
        webmedClientSecret: process.env.WEBMED_CLIENT_SECRET,
        navEpjClientSecret: process.env.NAV_EPJ_CLIENT_SECRET,
    } satisfies Record<keyof FhirConfigurationDev, unknown>)

export function getKnownDevFhirServers(): KnownFhirServer[] {
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
            name: 'nav-epj',
            issuer: 'https://epj.ekstern.dev.nav.no/fhir',
            type: 'confidential-symmetric',
            method: 'client_secret_basic',
            clientSecret: configuration.navEpjClientSecret,
        },
    ]
}
