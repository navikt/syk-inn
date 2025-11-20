import { ReadyClient } from '@navikt/smart-on-fhir/client'
import { logger } from '@navikt/next-logger'
import { FhirPractitioner } from '@navikt/smart-on-fhir/zod'
import { YogaInitialContext } from 'graphql-yoga'

import { getReadyClient } from '@data-layer/fhir/smart/ready-client'
import { NoSmartSession } from '@data-layer/fhir/error/Errors'
import { getHpr } from '@data-layer/fhir/mappers/practitioner'
import { failSpan, spanServerAsync } from '@lib/otel/server'
import { getCurrentPatientFromExtension } from '@data-layer/graphql/yoga-utils'
import { CommonGraphqlContext } from '@data-layer/graphql/common-context'

import { assertIsPilotUser } from '../common/pilot-user-utils'

const OtelNamespace = 'GraphQL(FHIR).context'

export type FhirGraphqlContext = CommonGraphqlContext & {
    client: ReadyClient
    practitioner: FhirPractitioner
}

export const createFhirResolverContext = async (context: YogaInitialContext): Promise<FhirGraphqlContext> => {
    return spanServerAsync(OtelNamespace, async (span) => {
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

        const currentPatientIdent = getCurrentPatientFromExtension(context.params.extensions)
        span.setAttribute(`${OtelNamespace}.hasPatientIdent`, currentPatientIdent != null)

        return { client, practitioner, hpr, patientIdent: currentPatientIdent }
    })
}
