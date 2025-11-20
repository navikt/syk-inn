import { YogaInitialContext } from 'graphql-yoga'

import { assertIsPilotUser } from '@data-layer/common/pilot-user-utils'
import { getCurrentPatientFromExtension } from '@data-layer/graphql/yoga-utils'
import { CommonGraphqlContext } from '@data-layer/graphql/common-context'
import { failSpan, spanServerAsync } from '@lib/otel/server'

import { getHelseIdBehandler } from './helseid-service'
import { NoHelseIdSession } from './error/Errors'
import { validateHelseIdToken } from './token/validate'

const OtelNamespace = 'GraphQL(HelseID).context'

export type HelseIdGraphqlContext = CommonGraphqlContext & {
    name: string
}

export const createHelseIdResolverContext = async (context: YogaInitialContext): Promise<HelseIdGraphqlContext> => {
    return spanServerAsync(OtelNamespace, async (span) => {
        const validToken = await validateHelseIdToken()
        if (!validToken) {
            failSpan(span, 'Invalid or missing HelseID token')
            throw NoHelseIdSession()
        }

        const behandler = await getHelseIdBehandler()
        if (behandler?.hpr == null) {
            failSpan(span, 'Behandler without HPR (HelseID)')
            throw NoHelseIdSession()
        }

        try {
            await assertIsPilotUser(behandler.hpr)
        } catch {
            failSpan(span, 'Non pilot user in GQL')
            throw NoHelseIdSession()
        }

        const currentPatientIdent = getCurrentPatientFromExtension(context.params.extensions)
        span.setAttribute(`${OtelNamespace}.hasPatientIdent`, currentPatientIdent != null)

        return { hpr: behandler.hpr, name: behandler.navn, patientIdent: currentPatientIdent }
    })
}
