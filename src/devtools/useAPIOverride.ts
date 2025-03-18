/* eslint-disable @typescript-eslint/no-explicit-any */

import { logger } from '@navikt/next-logger'
import { parseAsArrayOf, parseAsString, useQueryState } from 'nuqs'

import { isResourceAvailable, DataService } from '../data-fetcher/data-service'

export function withFailInterceptor(dataService: DataService): DataService {
    return {
        mode: dataService.mode,
        context: {
            pasient: isResourceAvailable(dataService.context.pasient)
                ? failIfOverride('context', 'pasient', dataService.context.pasient)
                : dataService.context.pasient,
            konsultasjon: isResourceAvailable(dataService.context.konsultasjon)
                ? failIfOverride('context', 'konsultasjon', dataService.context.konsultasjon)
                : dataService.context.konsultasjon,
            arbeidsgivere: isResourceAvailable(dataService.context.arbeidsgivere)
                ? failIfOverride('context', 'arbeidsgivere', dataService.context.arbeidsgivere)
                : dataService.context.arbeidsgivere,
            behandler: dataService.context.behandler,
            tidligereSykmeldinger: isResourceAvailable(dataService.context.tidligereSykmeldinger)
                ? failIfOverride('context', 'tidligereSykmeldinger', dataService.context.tidligereSykmeldinger)
                : dataService.context.tidligereSykmeldinger,
        },
        query: {
            pasient: isResourceAvailable(dataService.query.pasient)
                ? failIfOverride('query', 'pasient', dataService.query.pasient)
                : dataService.query.pasient,
            sykmelding: failIfOverride('query', 'sykmelding', dataService.query.sykmelding),
        },
        mutation: {
            sendSykmelding: failIfOverride('mutation', 'sendSykmelding', dataService.mutation.sendSykmelding),
            writeToEhr: failIfOverride('mutation', 'writeToEhr', dataService.mutation.writeToEhr),
        },
    }
}

export function useAPIOverride(): {
    contextOverrides: string[]
    queryOverrides: string[]
    setContextOverrides: (overrides: string[]) => void
    setQueryOverrides: (overrides: string[]) => void
} {
    const [contextOverrides, setContextOverrides] = useQueryState(
        'context-fails',
        parseAsArrayOf(parseAsString).withDefault([]).withOptions({ clearOnDefault: true }),
    )
    const [queryOverrides, setQueryOverrides] = useQueryState(
        'query-fails',
        parseAsArrayOf(parseAsString).withDefault([]).withOptions({ clearOnDefault: true }),
    )

    return {
        contextOverrides,
        queryOverrides,
        setContextOverrides,
        setQueryOverrides,
    }
}

/**
 * Legal use of any: The function signature here is irrelevant, and will be inferred as the correct type by the caller
 */
function failIfOverride<Fn extends (...args: any[]) => Promise<any>>(group: string, what: string, fn: Fn): Fn {
    if (!isResourceAvailable(fn)) return fn

    const interceptor: Fn = ((...args) => {
        /**
         * Params are parsed lazily instead of using nuqs, because we don't want to use nuqs hook
         * this high in the rendering tree, as it interfers with the pre-rendering that next does
         */
        const params = new URLSearchParams(window.location.search)
        const rawParams = (group === 'context' ? params.get('context-fails') : params.get('query-fails')) ?? ''
        const overrides: string[] | undefined = rawParams.split(',').filter((it) => !!it)

        if (overrides?.includes(what)) {
            logger.warn(`Failing ${group} ${what} to fail because DevTools says so`)
            throw new Error(`This query fails because ${what} is configured to fail in the dev-tools`)
        }

        return fn(...args)
    }) as Fn

    return interceptor
}
