import { GraphQLError } from 'graphql/error'
import { CombinedGraphQLErrors, ErrorLike } from '@apollo/client'

export const NoHelseIdSession = (): GraphQLError =>
    new GraphQLError('Du har blitt logget ut', {
        extensions: { code: 'HELSEID_SESSION_INVALID' },
    })

export function iHelseIdSessionInvalid(error: ErrorLike): boolean {
    if (!CombinedGraphQLErrors.is(error)) return false

    return error.errors.some((e) => e.extensions?.code === 'SMART_SESSION_INVALID')
}
