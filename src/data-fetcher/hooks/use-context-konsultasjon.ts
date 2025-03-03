import { useQuery, UseQueryResult } from '@tanstack/react-query'

import { assertResourceAvailable, isResourceAvailable, KonsultasjonInfo } from '../data-service'
import { useDataService } from '../data-provider'

export function useContextKonsultasjon(): UseQueryResult<KonsultasjonInfo, Error> {
    const dataService = useDataService()
    return useQuery({
        queryKey: ['konsultasjon'],
        queryFn: (): Promise<KonsultasjonInfo> => {
            assertResourceAvailable(dataService.context.konsultasjon)

            return dataService.context.konsultasjon()
        },
        enabled: isResourceAvailable(dataService.context.konsultasjon),
        // TODO: Temporarily disable retry while WebMed doesn't support it
        retry: false,
    })
}
