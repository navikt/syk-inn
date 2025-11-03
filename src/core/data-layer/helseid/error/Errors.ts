import { GraphQLError } from 'graphql/error'

export const NoHelseIdSession = (): GraphQLError =>
    new GraphQLError('Du har blitt logget ut', {
        extensions: { code: 'HELSEID_SESSION_INVALID' },
    })
