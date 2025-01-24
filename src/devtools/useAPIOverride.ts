/* eslint-disable @typescript-eslint/no-explicit-any */

import { logger } from '@navikt/next-logger'
import { parseAsArrayOf, parseAsString, useQueryState } from 'nuqs'

import type { NotAvailable } from '@components/ny-sykmelding-form/data-provider/NySykmeldingFormDataService'
import {
    isResourceAvailable,
    NySykmeldingFormDataService,
} from '@components/ny-sykmelding-form/data-provider/NySykmeldingFormDataService'

export function withFailInterceptor(dataService: NySykmeldingFormDataService): NySykmeldingFormDataService {
    return {
        context: {
            pasient: failIfOverride('context', 'pasient', dataService.context.pasient),
            konsultasjon: failIfOverride('context', 'konsultasjon', dataService.context.konsultasjon),
            arbeidsgivere: failIfOverride('context', 'arbeidsgivere', dataService.context.arbeidsgivere),
            behandler: dataService.context.behandler,
        },
        query: {
            pasient: failIfOverride('query', 'pasient', dataService.query.pasient),
        },
        mutation: {
            sendSykmelding: dataService.mutation.sendSykmelding,
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
function failIfOverride<Fn extends (...args: any[]) => Promise<any>>(
    group: string,
    what: string,
    fn: Fn | NotAvailable,
): Fn | NotAvailable {
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
