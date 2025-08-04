/* eslint-disable react-hooks/rules-of-hooks */

import { logger } from '@navikt/next-logger'
import { GraphQLSchema } from 'graphql/type'
import { createYoga, Plugin } from 'graphql-yoga'
import { useOpenTelemetry } from '@envelop/opentelemetry'
import { trace } from '@opentelemetry/api'

import { bundledEnv, isDemo, isLocal } from '@lib/env'
import { wait } from '@lib/wait'

interface NextContext {
    params: Promise<Record<string, string>>
}

export function createGraphQLHandler(
    schema: GraphQLSchema,
    path: '/fhir/graphql' | '/graphql',
): (request: Request, ctx: NextContext) => Response | Promise<Response> {
    const defaultPlugins = [
        useOpenTelemetry(
            {
                resolvers: false,
                document: false,
                variables: false,
                result: false,
            },
            trace.getTracerProvider(),
        ),
    ]

    const { handleRequest } = createYoga<NextContext>({
        schema,
        logging: logger,
        plugins: isLocal || isDemo ? [...defaultPlugins, slowdownPlugin()] : defaultPlugins,
        graphqlEndpoint: path,
        fetchAPI: { Response },
    })

    return handleRequest
}

function slowdownPlugin(): Plugin {
    if (!(isLocal || isDemo)) {
        throw new Error(`Trying to use slowdown plugin in ${bundledEnv.runtimeEnv}, that's illegal!`)
    }

    return {
        async onExecute({ args }) {
            const waitedTime = await wait()

            const opName = args.operationName ?? 'Unnamed Operation'
            logger.warn(
                "[GraphQL Yoga] SlowDownPlugin: Operation '%s' was artificially delayed by %d ms",
                opName,
                waitedTime,
            )
        },
    }
}
