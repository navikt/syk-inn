import { getHelseIdBehandler } from './helseid-service'
import { NoHelseIdSession } from './error/Errors'

export type HelseIdGraphqlContext = {
    hpr: string
}

export const createHelseIdResolverContext = async (): Promise<HelseIdGraphqlContext> => {
    const behandler = await getHelseIdBehandler()

    if (!behandler.hpr) throw NoHelseIdSession()

    return { hpr: behandler.hpr }
}
