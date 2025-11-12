import { ReadyClient } from '@navikt/smart-on-fhir/client'
import { logger } from '@navikt/next-logger'

import { getReadyClient } from '@data-layer/fhir/smart/ready-client'
import { NoSmartSession } from '@data-layer/fhir/error/Errors'
import { getHpr } from '@data-layer/fhir/mappers/practitioner'
import { failSpan, spanServerAsync } from '@lib/otel/server'
import { assertIsPilotUser } from '@data-layer/fhir/fhir-graphql-utils'

export type FhirGraphqlContext = {
    client: ReadyClient
}

export const createFhirResolverContext = async (): Promise<FhirGraphqlContext> => {
    return spanServerAsync('GraphQL(FHIR).context', async (span) => {
        const client = await getReadyClient()

        if ('error' in client) {
            failSpan(span, client.error)
            throw NoSmartSession()
        }

        const practitioner = await client.user.request()
        if ('error' in practitioner) {
            failSpan(span, 'Practitioner without HPR')
            throw NoSmartSession()
        }

        const hpr = getHpr(practitioner.identifier)
        if (hpr == null) {
            failSpan(span, 'Practitioner without HPR')
            logger.warn(`Practitioner does not have HPR, practitioner: ${JSON.stringify(practitioner)}`)
            throw NoSmartSession()
        }

        try {
            await assertIsPilotUser(hpr)
        } catch {
            failSpan(span, 'Non pilot user in GQL')
            throw NoSmartSession()
        }

        return { client }
    })
}
