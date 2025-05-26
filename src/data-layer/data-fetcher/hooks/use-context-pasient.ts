import { useQuery, UseQueryResult } from '@tanstack/react-query'

import { PasientInfo } from '@data-layer/resources'

import { assertResourceAvailable, isResourceAvailable } from '../data-service'
import { useDataService } from '../data-provider'

export function useContextPasient(): UseQueryResult<PasientInfo | null, Error> {
    const dataService = useDataService()
    return useQuery({
        queryKey: ['pasient'],
        queryFn: async () => {
            if (!isResourceAvailable(dataService.context.pasient)) {
                return null
            }

            assertResourceAvailable(dataService.context.pasient)

            return dataService.context.pasient()
        },
    })
}
