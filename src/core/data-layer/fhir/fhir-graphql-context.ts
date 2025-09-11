import { ReadyClient } from '@navikt/smart-on-fhir/client'

import { getReadyClient } from '@data-layer/fhir/smart/ready-client'
import { NoSmartSession } from '@data-layer/fhir/error/Errors'

export type FhirGraphqlContext = {
    client: ReadyClient
}

export const createFhirResolverContext = async (): Promise<FhirGraphqlContext> => {
    const client = await getReadyClient({ validate: true })

    if ('error' in client) {
        throw NoSmartSession()
    }

    return { client }
}
