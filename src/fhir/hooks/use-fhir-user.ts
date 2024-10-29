import { useQuery, UseQueryResult } from '@tanstack/react-query'

import {
    assertResourceAvailable,
    BrukerInfo,
} from '@components/ny-sykmelding-form/data-provider/NySykmeldingFormDataService'
import { useNySykmeldingDataService } from '@components/ny-sykmelding-form/data-provider/NySykmeldingFormDataProvider'

const FhirUserInfoKey = ['fhir-user-info'] as const

export function useFhirUser(): UseQueryResult<BrukerInfo, Error> {
    const dataService = useNySykmeldingDataService()
    return useQuery({
        queryKey: FhirUserInfoKey,
        queryFn: async () => {
            assertResourceAvailable(dataService.context.bruker)

            return await dataService.context.bruker()
        },
    })
}
