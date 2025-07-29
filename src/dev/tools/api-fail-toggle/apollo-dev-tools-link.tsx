import { ApolloLink, Observable } from '@apollo/client'
import { logger } from '@navikt/next-logger'

import { isLocal, isDemo } from '@lib/env'

export const FailingLinkDev = (): ApolloLink =>
    new ApolloLink((operation, forward) => {
        if (!(isLocal || isDemo)) {
            logger.error('FailingLinkDev should only be used in local or demo environments')
        }

        const params = new URLSearchParams(window.location.search)
        const queryOverrides = (params.get('query-fails') ?? '').split(',')

        const overrides: string[] = queryOverrides.filter((it) => !!it)
        if (overrides.includes(operation.operationName)) {
            return new Observable((observer) => {
                observer.error(new Error(`Operation "${operation.operationName}" failed intentionally`))
            })
        }
        return forward(operation)
    })
