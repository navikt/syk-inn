import { GraphQLError } from 'graphql/error'

import { validateHelseIdToken } from '@data-layer/helseid/token/validate'

import { getHelseIdBehandler } from './helseid-service'
import { NoHelseIdSession } from './error/Errors'

export type HelseIdGraphqlContext = {
    hpr: string
    name: string
}

export const createHelseIdResolverContext = async (): Promise<HelseIdGraphqlContext> => {
    const validToken = await validateHelseIdToken()
    if (!validToken) {
        throw new GraphQLError('Du har blitt logget ut', {
            extensions: { code: 'HELSEID_SESSION_INVALID' },
        })
    }

    const behandler = await getHelseIdBehandler()

    if (!behandler.hpr) throw NoHelseIdSession()

    return { hpr: behandler.hpr, name: behandler.navn }
}
