import { useQuery, UseQueryResult } from '@tanstack/react-query'

import { useDataService } from '@data-layer/data-fetcher/data-provider'
import { assertResourceAvailable, isResourceAvailable } from '@data-layer/data-fetcher/data-service'
import { PersonQueryInfo } from '@data-layer/resources'

import { withSpanAsync } from '../../../otel/otel'

export function usePersonQuery(ident: string | null): UseQueryResult<PersonQueryInfo | null, Error> {
    const dataService = useDataService()

    return useQuery({
        queryKey: ['person', ident],
        queryFn: withSpanAsync('person søk', async () => {
            if (!isResourceAvailable(dataService.query.pasient) || ident == null) {
                return null
            }

            assertResourceAvailable(dataService.query.pasient)

            return dataService.query.pasient(ident)
        }),
        enabled: ident != null,
    })
}
