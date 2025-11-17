import { ApolloLink } from '@apollo/client'

export const persistentUserLink = new ApolloLink((operation, forward) => {
    return forward(operation)
})
