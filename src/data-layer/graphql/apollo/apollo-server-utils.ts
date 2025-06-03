import { ApolloServer } from '@apollo/server'
import { startServerAndCreateNextHandler } from '@as-integrations/next'
import { logger } from '@navikt/next-logger'
import { NextRequest } from 'next/server'
import { GraphQLSchema } from 'graphql/type'

import { getReadyClient } from '@fhir/smart/smart-client'
import { NoSmartSession } from '@graphql/error/Errors'

export const createApolloHandler = (schema: GraphQLSchema) => {
    const server = new ApolloServer({
        schema,
        logger,
    })

    const apolloHandler = startServerAndCreateNextHandler(server, {
        context: async () => {
            const client = await getReadyClient({ validate: true })
            if ('error' in client) {
                throw NoSmartSession()
            }

            return {
                readyClient: client,
            }
        },
    })

    return (req: NextRequest): Promise<Response> => apolloHandler(req)
}
