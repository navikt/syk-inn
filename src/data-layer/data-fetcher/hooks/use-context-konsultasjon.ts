import { useQuery, UseQueryResult } from '@tanstack/react-query'

import { Konsultasjon } from '@data-layer/data-fetcher/resources'

import { assertResourceAvailable, isResourceAvailable } from '../data-service'
import { useDataService } from '../data-provider'
import { withSpanAsync } from '../../../otel/otel'

export function useContextKonsultasjon(): UseQueryResult<Konsultasjon, Error> {
    const dataService = useDataService()
    return useQuery({
        queryKey: ['konsultasjon'],
        queryFn: withSpanAsync('konsultasjonsInfo', (): Promise<Konsultasjon> => {
            assertResourceAvailable(dataService.context.konsultasjon)

            return dataService.context.konsultasjon()
        }),
        enabled: isResourceAvailable(dataService.context.konsultasjon),
    })
}
