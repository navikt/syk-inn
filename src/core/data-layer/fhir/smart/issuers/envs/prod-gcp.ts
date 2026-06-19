import { KnownFhirServer } from '@navikt/smart-on-fhir/client'
import * as z from 'zod'

type EhrConfigurationProd = z.infer<typeof EhrConfigurationProdSchema>
const EhrConfigurationProdSchema = z.object({
    webmedClientSecret: z.string(),
})

export const getProdFhirConfiguration = (): EhrConfigurationProd =>
    EhrConfigurationProdSchema.parse({
        webmedClientSecret: process.env.WEBMED_CLIENT_SECRET,
    } satisfies Record<keyof EhrConfigurationProd, unknown>)

export function getKnownProdFhirServers(): KnownFhirServer[] {
    const configuration = getProdFhirConfiguration()

    return [
        {
            name: 'WebMed',
            issuer: 'https://fhirapi.public.webmed.no',
            type: 'confidential-symmetric',
            method: 'client_secret_basic',
            clientSecret: configuration.webmedClientSecret,
        },
    ]
}
