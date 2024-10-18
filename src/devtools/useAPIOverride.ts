import { logger } from '@navikt/next-logger'
import { parseAsArrayOf, parseAsString, useQueryState } from 'nuqs'

import { NySykmeldingFormDataService } from '@components/ny-sykmelding/data-provider/NySykmeldingFormDataService'

export function useWithFailInterceptor(dataService: NySykmeldingFormDataService): NySykmeldingFormDataService {
    const { contextOverrides, queryOverrides } = useAPIOverride()

    const failIfOverride = <Fn>(group: string, what: string, fn: Fn): Fn => {
        const overrides: string[] | undefined = group === 'context' ? contextOverrides : queryOverrides

        if (overrides?.includes(what)) {
            logger.warn(`Configuring ${group} ${what} to fail because DevTools says so`)
            return (() => {
                logger.warn(`Failing ${group} ${what} to fail because DevTools says so`)
                throw new Error(`This query fails because ${what} is configured to fail in the dev-tools`)
            }) as Fn
        }

        return fn
    }

    return {
        context: {
            pasient: failIfOverride('context', 'pasient', dataService.context.pasient),
            arbeidsgivere: failIfOverride('context', 'arbeidsgivere', dataService.context.arbeidsgivere),
            bruker: failIfOverride('context', 'bruker', dataService.context.bruker),
        },
        query: {
            pasient: failIfOverride('query', 'pasient', dataService.query.pasient),
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
