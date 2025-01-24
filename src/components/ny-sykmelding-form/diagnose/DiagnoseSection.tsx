import React, { ReactElement } from 'react'
import { Detail, Skeleton } from '@navikt/ds-react'
import { useQuery } from '@tanstack/react-query'

import DiagnoseSmartPicker from '@components/ny-sykmelding-form/diagnose/DiagnoseSmartPicker'
import {
    assertResourceAvailable,
    isResourceAvailable,
    KonsultasjonInfo,
} from '@components/ny-sykmelding-form/data-provider/NySykmeldingFormDataService'
import { useNySykmeldingDataService } from '@components/ny-sykmelding-form/data-provider/NySykmeldingFormDataProvider'

function DiagnoseSection(): ReactElement {
    const dataService = useNySykmeldingDataService()
    const { data, isLoading, error } = useQuery({
        queryKey: ['konsultasjon'],
        queryFn: (): Promise<KonsultasjonInfo> => {
            assertResourceAvailable(dataService.context.konsultasjon)

            return dataService.context.konsultasjon()
        },
        enabled: isResourceAvailable(dataService.context.konsultasjon),
    })
    console.log('data: ', data)
    return (
        <div>
            <Detail spacing>Pasientens medisinske diagnose. Søket søker i både ICPC-2 og ICD-10 diagnosekoder.</Detail>
            {!isLoading ? (
                <DiagnoseSmartPicker suggestedDiagnoser={data?.diagnoser ?? null} />
            ) : (
                <DiagnoseSmartPickerLoadingSkeleton />
            )}
            {error && <Detail>Klarte ikke å hente diagnoseforslag</Detail>}
        </div>
    )
}

function DiagnoseSmartPickerLoadingSkeleton(): ReactElement {
    return (
        <div>
            <Skeleton width="40%" />
            <Skeleton variant="rectangle" className="mt-2" height={48} />
            <Skeleton width="50%" className="mt-3" />
            <div className="flex gap-3 mt-2">
                <Skeleton variant="rectangle" height={32} width={128} />
                <Skeleton variant="rectangle" height={32} width={128} />
            </div>
        </div>
    )
}

export default DiagnoseSection
