import { useQuery, UseQueryResult } from '@tanstack/react-query'

import {
    assertResourceAvailable,
    PatientInfo,
} from '@components/ny-sykmelding-form/data-provider/NySykmeldingFormDataService'
import { useNySykmeldingDataService } from '@components/ny-sykmelding-form/data-provider/NySykmeldingFormDataProvider'

export function useContextPasient(): UseQueryResult<PatientInfo, Error> {
    const dataService = useNySykmeldingDataService()
    return useQuery({
        queryKey: ['pasient'],
        queryFn: async () => {
            assertResourceAvailable(dataService.context.pasient)

            return dataService.context.pasient()
        },
    })
}
