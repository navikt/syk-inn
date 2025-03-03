'use client'

import React, { ReactElement } from 'react'
import { Heading, Skeleton } from '@navikt/ds-react'

import { useContextPasient } from '../../data-fetcher/hooks/use-context-pasient'
import { useContextKonsultasjon } from '../../data-fetcher/hooks/use-context-konsultasjon'

import StepsSummary from './steps/StepsSummary'
import NySykmeldingFormSections from './NySykmeldingFormSections'

function NySykmeldingFormMultiStep(): ReactElement {
    const { isLoading, data, error } = useContextPasient()

    // Preload data for next steps
    useContextKonsultasjon()

    if (error) {
        // Defer to global error handling
        throw error
    }

    return (
        <div className="mt-8">
            <Heading size="xlarge" level="2" spacing className="flex gap-3">
                Sykmelding for{' '}
                {!isLoading && data ? <span>{data.navn}</span> : <Skeleton width={240} className="-my-4" />}
            </Heading>
            <div className="flex">
                <div className="w-full">
                    <NySykmeldingFormSections />
                </div>
                <div className="w-full ml-8">
                    <StepsSummary />
                </div>
            </div>
        </div>
    )
}

export default NySykmeldingFormMultiStep
