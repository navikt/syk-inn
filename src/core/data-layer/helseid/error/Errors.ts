import { GraphQLError } from 'graphql/error'

export const NoHelseIdSession = (): GraphQLError =>
    new GraphQLError('Du har blitt logget ut', {
        extensions: { code: 'HELSEID_SESSION_INVALID' },
    })

export const NoHelseIdCurrentPatient = (): GraphQLError =>
    new GraphQLError('Ingen pasient valgt', {
        extensions: { code: 'HELSEID_NO_CURRENT_PATIENT' },
    })
