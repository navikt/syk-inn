import * as z from 'zod'
import { KnownFhirServer } from '@navikt/smart-on-fhir/client'

import { KeysOfUnion } from '@lib/ts'

type FhirConfigurationDev = z.infer<typeof FhirConfigurationDevSchema>
const FhirConfigurationDevSchema = z.object({
    webmedClientSecret: z.string(),
})

export const getDevFhirConfiguration = (): FhirConfigurationDev =>
    FhirConfigurationDevSchema.parse({
        webmedClientSecret: process.env.WEBMED_CLIENT_SECRET,
    } satisfies Record<KeysOfUnion<FhirConfigurationDev>, unknown | undefined>)

export function getKnownDevFhirServers(): KnownFhirServer[] {
    const configuration = getDevFhirConfiguration()

    return [
        {
            issuer: 'https://fhir-api-auth.public.webmedepj.no',
            type: 'confidential-symmetric',
            method: 'client_secret_basic',
            clientSecret: configuration.webmedClientSecret,
        },
    ]
}
