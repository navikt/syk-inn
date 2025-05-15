import React, { PropsWithChildren, ReactElement, useEffect } from 'react'
import { BodyShort, Heading, Skeleton } from '@navikt/ds-react'
import { ExclamationmarkTriangleIcon } from '@navikt/aksel-icons'

import { useContextKonsultasjon } from '../../../data-fetcher/hooks/use-context-konsultasjon'
import { useFormContext } from '../form'

import DiagnosePicker from './DiagnosePicker'

function DiagnoseSection(): ReactElement {
    const { setValue } = useFormContext()
    const { data, isLoading, error } = useContextKonsultasjon()

    useEffect(() => {
        if (data == null || data.diagnoser.length === 0) return

        const [first] = data.diagnoser

        setValue('diagnoser.hoved', {
            code: first.kode,
            system: first.system,
            text: first.tekst,
        })
    }, [data, setValue])

    return (
        <div>
            {!isLoading ? (
                <DiagnoseSectionWithData>
                    {error && (
                        <BodyShort className="mt-2 flex gap-1 items-center">
                            <ExclamationmarkTriangleIcon aria-hidden />
                            Kunne ikke hente diagnoser, du kan fortsatt velge diagnosen manuelt.
                        </BodyShort>
                    )}
                </DiagnoseSectionWithData>
            ) : (
                <DiagnoseSectionSkeleton />
            )}
        </div>
    )
}

function DiagnoseSectionWithData({ children }: PropsWithChildren): ReactElement {
    return (
        <div>
            <Heading level="3" size="small">
                Diagnose
            </Heading>
            <DiagnosePicker />
            {children}
        </div>
    )
}

function DiagnoseSectionSkeleton(): ReactElement {
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
