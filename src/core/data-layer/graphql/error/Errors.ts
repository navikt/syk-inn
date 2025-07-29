import { GraphQLError } from 'graphql/error'
import { ApolloError } from '@apollo/client'

export const NoSmartSession = (): GraphQLError =>
    new GraphQLError('Du har blitt logget ut', {
        extensions: { code: 'SMART_SESSION_INVALID' },
    })

export function isSmartSessionInvalid(error: ApolloError): boolean {
    return error.graphQLErrors.some((e) => e.extensions?.code === 'SMART_SESSION_INVALID')
}
