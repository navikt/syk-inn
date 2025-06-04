import { ApolloServer } from '@apollo/server'
import { startServerAndCreateNextHandler } from '@as-integrations/next'
import { logger } from '@navikt/next-logger'
import { NextRequest } from 'next/server'
import { GraphQLSchema } from 'graphql/type'

export const createApolloHandler = (schema: GraphQLSchema) => {
    const server = new ApolloServer({
        schema,
        logger,
    })

    const apolloHandler = startServerAndCreateNextHandler(server)

    return (req: NextRequest): Promise<Response> => apolloHandler(req)
}
