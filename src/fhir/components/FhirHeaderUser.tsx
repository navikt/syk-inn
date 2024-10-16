'use client'

import React, { ReactElement } from 'react'
import { createPortal } from 'react-dom'
import { Alert, BodyShort, Detail, Skeleton } from '@navikt/ds-react'
import { useQuery } from '@tanstack/react-query'

import { useNySykmeldingDataService } from '@components/ny-sykmelding-form/data-provider/NySykmeldingFormDataProvider'
import { assertResourceAvailable } from '@components/ny-sykmelding-form/data-provider/NySykmeldingFormDataService'

function FhirHeaderUser(): ReactElement {
    const dataService = useNySykmeldingDataService()
    const { data, isLoading, error } = useQuery({
        queryKey: ['fhir-user-info'],
        queryFn: async () => {
            assertResourceAvailable(dataService.context.bruker)
            return await dataService.context.bruker()
        },
    })

    /**
     * This component portals into a slot in the header, because the FhirHeader is
     * rendered outside of the normal data-provider.
     */
    return createPortal(
        <div className="h-full flex flex-col justify-center items-end mr-2">
            {isLoading && (
                <>
                    <Skeleton width={140} />
                    <Skeleton width={80} />
                </>
            )}
            {error && !isLoading && (
                <Alert variant="error" size="small">
                    Kunne ikke hente brukerinformasjon
                </Alert>
            )}
            {!isLoading && data && (
                <>
                    <BodyShort>{data.navn}</BodyShort>
                    <Detail>{data.epjDescription}</Detail>
                </>
            )}
        </div>,
        document.getElementById('fhir-user-portal')!,
    )
}

export default FhirHeaderUser
