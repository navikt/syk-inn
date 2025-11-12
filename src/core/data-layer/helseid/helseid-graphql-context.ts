import { validateHelseIdToken } from '@data-layer/helseid/token/validate'
import { assertIsPilotUser } from '@data-layer/fhir/fhir-graphql-utils'

import { getHelseIdBehandler } from './helseid-service'
import { NoHelseIdSession } from './error/Errors'

export type HelseIdGraphqlContext = {
    hpr: string
    name: string
}

export const createHelseIdResolverContext = async (): Promise<HelseIdGraphqlContext> => {
    const validToken = await validateHelseIdToken()
    if (!validToken) {
        throw NoHelseIdSession()
    }

    const behandler = await getHelseIdBehandler()
    if (behandler?.hpr == null) throw NoHelseIdSession()

    await assertIsPilotUser(behandler.hpr)

    return { hpr: behandler.hpr, name: behandler.navn }
}
