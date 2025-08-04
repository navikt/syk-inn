/* eslint-disable @typescript-eslint/explicit-function-return-type */

import { logger } from '@navikt/next-logger'
import { GraphQLSchema } from 'graphql/type'
import { createYoga, Plugin } from 'graphql-yoga'

import { bundledEnv, isDemo, isLocal } from '@lib/env'
import { wait } from '@lib/wait'
import { pathWithBasePath } from '@lib/url'

export const createGraphQLHandler = (schema: GraphQLSchema) => {
    const { handleRequest } = createYoga({
        schema,
        logging: logger,
        plugins: isLocal || isDemo ? [slowdownPlugin()] : undefined,
        graphqlEndpoint: pathWithBasePath('/fhir/graphql'),
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
