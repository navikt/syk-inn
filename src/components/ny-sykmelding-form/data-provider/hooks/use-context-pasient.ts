import { useQuery, UseQueryResult } from '@tanstack/react-query'

import {
    assertResourceAvailable,
    isResourceAvailable,
    PatientInfo,
} from '@components/ny-sykmelding-form/data-provider/NySykmeldingFormDataService'
import { useNySykmeldingDataService } from '@components/ny-sykmelding-form/data-provider/NySykmeldingFormDataProvider'

export function useContextPasient(
    opts: { allowContextless: boolean } = { allowContextless: false },
): UseQueryResult<PatientInfo, Error> {
    const dataService = useNySykmeldingDataService()
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
