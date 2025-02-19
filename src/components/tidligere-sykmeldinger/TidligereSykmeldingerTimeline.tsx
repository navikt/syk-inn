'use client'

import React, { ReactElement } from 'react'
import { BodyShort } from '@navikt/ds-react'
import { FaceCryIcon, FileLoadingIcon } from '@navikt/aksel-icons'
import { useQuery } from '@tanstack/react-query'

import { FormSection } from '@components/ui/form'

import { useDataService } from '../../data-fetcher/data-provider'
import { DataService } from '../../data-fetcher/data-service'

function TidligereSykmeldingerTimeline(): ReactElement {
    const dataService: DataService = useDataService()
    const { data, error, isLoading } = useQuery({
        queryKey: ['tidligereSykmeldinger'],
        queryFn: async () => dataService.context.tidligereSykmeldinger,
    })

    if (isLoading) {
        return (
            <div className="flex flex-col gap-3 max-w-prose mb-3">
                <FormSection title="Laster tidligere sykmeldinger" icon={<FileLoadingIcon />}>
                    <div>Ser om vi finner tidligere sykmeldinger...</div>
                </FormSection>
            </div>
        )
    }

    if (error instanceof Error) {
        return (
            <div className="flex flex-col gap-3 max-w-prose mb-3">
                <FormSection title="Forsøkte å laste sykmeldinger" icon={<FaceCryIcon />}>
                    <div>Fant ingen tidligere sykmeldinger - Pasient ikke funnet</div>
                    <div>Error: {error.message}</div>;
                </FormSection>
            </div>
        )
    }

    return (
        <div>
            <h2>Tidligere Sykmeldinger</h2>
            {data && Array.isArray(data) ? (
                data.map((sykmelding) => (
                    <div key={sykmelding.sykmeldingId} style={{ marginBottom: '8px' }}>
                        <BodyShort spacing>
                            <strong>Periode:</strong> {sykmelding.periode.fom} - {sykmelding.periode.tom}
                        </BodyShort>
                    </div>
                ))
            ) : (
                <div className="flex flex-col gap-3 max-w-prose mb-3">
                    <FormSection title="Forsøkte å laste sykmeldinger" icon={<FaceCryIcon />}>
                        <div>Fant ingen tidligere sykmeldinger - Pasient ikke funnet</div>
                    </FormSection>
                </div>
            )}
        </div>
    )
    // return (
    //     <div className="flex flex-col gap-3 max-w-prose mb-3">
    //         <Detail>Tidligere sykmeldinger</Detail>
    //
    //         {data && Array.isArray(data) ? (
    //             data.map((sykmelding) => (
    //                 <div key={sykmelding.sykmeldingId}>
    //             <div key={sykmelding.sykmeldingId} style={{ marginBottom: '8px' }}>
    //                 <BodyShort spacing>
    //                     <strong>Periode:</strong> {sykmelding.periode.fom} - {sykmelding.periode.tom}
    //                 </BodyShort>
    //             </div>
    //                 </div>
    //
    //             ))
    //     </div>
    // )
}

export default TidligereSykmeldingerTimeline
