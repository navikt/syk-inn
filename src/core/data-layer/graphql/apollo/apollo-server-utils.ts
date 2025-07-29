import { ApolloServer, GraphQLRequestContextDidResolveOperation, ApolloServerPlugin, BaseContext } from '@apollo/server'
import { startServerAndCreateNextHandler } from '@as-integrations/next'
import { logger } from '@navikt/next-logger'
import { NextRequest } from 'next/server'
import { GraphQLSchema } from 'graphql/type'

import { bundledEnv, isDemo, isLocal } from '@lib/env'
import { wait } from '@lib/wait'

export const createApolloHandler = (schema: GraphQLSchema) => {
    const server = new ApolloServer({
        schema,
        logger,
        plugins: isLocal || isDemo ? [SlowDownPlugin()] : undefined,
    })

    const apolloHandler = startServerAndCreateNextHandler(server)

    return (req: NextRequest): Promise<Response> => apolloHandler(req)
}

function SlowDownPlugin(): ApolloServerPlugin {
    if (!(isLocal || isDemo)) {
        throw new Error(`Trying to use slowdown plugin in ${bundledEnv.runtimeEnv}, that's illegal!`)
    }

    return {
        async requestDidStart() {
            return {
                async didResolveOperation(ctx: GraphQLRequestContextDidResolveOperation<BaseContext>) {
                    const waitedTime = await wait()

                    const opName = ctx.operationName || 'Unnamed'
                    logger.warn(
                        "[Apollo Server] SlowDownPlugin: Operation '%s' was artificially delayed by %d ms",
                        opName,
                        waitedTime,
                    )
                },
            }
        },
    }
}
