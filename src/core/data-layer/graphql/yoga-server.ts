/* eslint-disable react-hooks/rules-of-hooks */

import { logger as pinoLogger } from '@navikt/next-logger'
import { GraphQLSchema } from 'graphql/type'
import { createYoga, Plugin } from 'graphql-yoga'
import { useOpenTelemetry } from '@envelop/opentelemetry'
import { trace } from '@opentelemetry/api'

import { bundledEnv, isDemo, isLocal } from '@lib/env'
import { wait } from '@lib/wait'
import { ModeType } from '@core/providers/ModePaths'

import { NextContext, YogaContext } from './yoga-utils'

const logger = pinoLogger.child({}, { msgPrefix: '[GraphQL-Yoga]: ' })

export function createGraphQLHandler<UserContext extends Record<string, unknown>>(
    schema: GraphQLSchema,
    mode: ModeType,
    options: {
        context: YogaContext<UserContext>
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
        runtimeSpecificPlugins.push(slowdownPlugin(mode))
    }
    if (options?.plugins) {
        runtimeSpecificPlugins.push(...options.plugins)
    }

    const { handleRequest } = createYoga<NextContext, UserContext>({
        schema,
        logging: logger,
        plugins: [...defaultPlugins, ...runtimeSpecificPlugins],
        fetchAPI: { Response },
        context: options?.context,
    })

    return handleRequest
}

function slowdownPlugin(mode: ModeType): Plugin {
    if (!(isLocal || isDemo)) {
        throw new Error(`Trying to use slowdown plugin in ${bundledEnv.runtimeEnv}, that's illegal!`)
    }

    const loggerPrefix = mode === 'FHIR' ? '[GraphQL - FHIR]' : '[GraphQL - HelseID]'

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
