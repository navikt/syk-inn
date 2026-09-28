import { ReadyClient } from '@navikt/smart-on-fhir/client'
import { YogaInitialContext } from 'graphql-yoga'
import { GraphQLError } from 'graphql/error'

import { validateHelseIdAccessToken } from '#core/auth/helseid/helseid'
import { failSpan, spanServerAsync } from '#lib/otel/server'

import { assertIsPilotUser } from '../common/pilot-user-utils'
import { CommonGraphqlContext } from '../graphql/common-context'
import { getCurrentPatientFromExtension } from '../graphql/yoga-utils'

import { getBehandler } from './resources/fhir-resources-service'
import { getReadyClient } from './smart/ready-client'

const OtelNamespace = 'GraphQL(FHIR).context'

export type FhirGraphqlContext = CommonGraphqlContext & {
    client: ReadyClient
}

export const createFhirResolverContext = async (context: YogaInitialContext): Promise<FhirGraphqlContext> => {
    return spanServerAsync(OtelNamespace, async (span) => {
        const [, , activePatientId] = new URL(context.request.url).pathname.split('/')
        const client = await getReadyClient(activePatientId)

        if ('error' in client) {
            failSpan(span, client.error)
            throw NoSmartSession()
        }

        if (!(await validateHelseIdAccessToken())) {
            failSpan(span, 'HelseID access token is invalid')
            throw NoSmartSession()
        }

        const behandler = await getBehandler(client)
        if (behandler == null) {
            failSpan(span, 'No valid HPR or request failed')
            throw NoSmartSession()
        }

        try {
            await assertIsPilotUser(behandler.hpr)
        } catch {
            failSpan(span, 'Non pilot user in GQL')
            throw NoSmartSession()
        }

        const currentPatientIdent = getCurrentPatientFromExtension(context.params.extensions)
        span.setAttribute(`${OtelNamespace}.hasPatientIdent`, currentPatientIdent != null)

        return { client, behandler, patientIdent: currentPatientIdent }
    })
}

export const NoSmartSession = (): GraphQLError =>
    new GraphQLError('Du har blitt logget ut', {
        extensions: { code: 'SMART_SESSION_INVALID' },
    })
