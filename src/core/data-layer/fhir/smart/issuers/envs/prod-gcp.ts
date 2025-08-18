import * as z from 'zod'
import { KnownFhirServer } from '@navikt/smart-on-fhir/client'

type EhrConfigurationProd = z.infer<typeof EhrConfigurationProdSchema>
const EhrConfigurationProdSchema = z.object({
    webmedClientSecret: z.string(),
})

export const getProdFhirConfiguration = (): EhrConfigurationProd =>
    EhrConfigurationProdSchema.parse({
        webmedClientSecret: process.env.WEBMED_CLIENT_SECRET,
    } satisfies Record<keyof EhrConfigurationProd, unknown | undefined>)

export function getKnownProdFhirServers(): KnownFhirServer[] {
    return []
}
