import { useQuery, UseQueryResult } from '@tanstack/react-query'

import { assertResourceAvailable, isResourceAvailable, PasientInfo } from '../data-service'
import { useDataService } from '../data-provider'

export function useContextPasient(
    opts: { allowContextless: boolean } = { allowContextless: false },
): UseQueryResult<PasientInfo | null, Error> {
    const dataService = useDataService()
    return useQuery({
        queryKey: ['pasient'],
        queryFn: async () => {
            if (opts.allowContextless && !isResourceAvailable(dataService.context.pasient)) {
                return null
            }

            assertResourceAvailable(dataService.context.pasient)

            return dataService.context.pasient()
        },
    })
}
