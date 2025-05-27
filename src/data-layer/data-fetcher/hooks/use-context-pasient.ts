import { useQuery, UseQueryResult } from '@tanstack/react-query'

import { Pasient } from '@data-layer/resources'

import { assertResourceAvailable, isResourceAvailable } from '../data-service'
import { useDataService } from '../data-provider'
import { withSpanAsync } from '../../../otel/otel'

export function useContextPasient(): UseQueryResult<Pasient | null, Error> {
    const dataService = useDataService()
    return useQuery({
        queryKey: ['pasient'],
        queryFn: withSpanAsync('pasient info hook', async () => {
            if (!isResourceAvailable(dataService.context.pasient)) {
                return null
            }

            assertResourceAvailable(dataService.context.pasient)

            return dataService.context.pasient()
        }),
    })
}
