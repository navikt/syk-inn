/* eslint-disable react-hooks/rules-of-hooks */

import { logger } from '@navikt/next-logger'
import { GraphQLSchema } from 'graphql/type'
import { createYoga, Plugin, YogaServerOptions } from 'graphql-yoga'
import { useOpenTelemetry } from '@envelop/opentelemetry'
import { trace } from '@opentelemetry/api'

import { bundledEnv, isDemo, isLocal } from '@lib/env'
import { wait } from '@lib/wait'

interface NextContext {
    params: Promise<Record<string, string>>
}

export function createGraphQLHandler<UserContext extends Record<string, unknown>>(
    schema: GraphQLSchema,
    path: '/fhir/graphql' | '/graphql',
    options?: {
        context?: YogaServerOptions<NextContext, UserContext>['context']
        plugins?: Plugin[]
    },
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

    const runtimeSpecificPlugins: Plugin[] = []
    if (isLocal || isDemo) {
        runtimeSpecificPlugins.push(slowdownPlugin(path))
    }
    if (options?.plugins) {
        runtimeSpecificPlugins.push(...options.plugins)
    }

    const { handleRequest } = createYoga<NextContext, UserContext>({
        schema,
        logging: logger,
        plugins: [...defaultPlugins, ...runtimeSpecificPlugins],
        graphqlEndpoint: path,
        fetchAPI: { Response },
        context: options?.context,
    })

    return handleRequest
}

function slowdownPlugin(path: '/fhir/graphql' | '/graphql'): Plugin {
    if (!(isLocal || isDemo)) {
        throw new Error(`Trying to use slowdown plugin in ${bundledEnv.runtimeEnv}, that's illegal!`)
    }

    const loggerPrefix = path === '/fhir/graphql' ? '[GraphQL - FHIR]' : '[GraphQL - HelseID]'

    return {
        async onExecute({ args }) {
            const waitedTime = await wait()

            const opName = args.operationName ?? 'Unnamed Operation'
            logger.warn(
                `${loggerPrefix} SlowDownPlugin: Operation '%s' was artificially delayed by %d ms`,
                opName,
                waitedTime,
            )
        },
    }
}
