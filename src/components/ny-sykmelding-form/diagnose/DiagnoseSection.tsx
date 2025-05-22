import React, { PropsWithChildren, ReactElement, useEffect } from 'react'
import { BodyShort, Heading, Skeleton } from '@navikt/ds-react'
import { ExclamationmarkTriangleIcon } from '@navikt/aksel-icons'

import { useContextKonsultasjon } from '../../../data-fetcher/hooks/use-context-konsultasjon'
import { useFormContext } from '../form'
import { useAppSelector } from '../../../providers/redux/hooks'

import DiagnosePicker from './DiagnosePicker'

function DiagnoseSection(): ReactElement {
    const { setValue } = useFormContext()
    const { data, isLoading, error } = useContextKonsultasjon()
    const existingDiagnose = useAppSelector((state) => state.nySykmeldingMultistep.diagnose)

    useEffect(() => {
        /**
         * Form already has been preloaded with a diagnose, don't use server suggestion
         *
         * TODO: These suggestions need to be hoisted to the top of the form, so that we can
         * weave existing persisted/steps data with server suggestions in a better way
         */
        if (existingDiagnose != null) return
        if (data == null || data.diagnoser.length === 0) return

        const [first] = data.diagnoser

        setValue('diagnoser.hoved', {
            code: first.kode,
            system: first.system,
            text: first.tekst,
        })
    }, [data, existingDiagnose, setValue])

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
        <section aria-labelledby="hoveddiagnose-section-heading">
            <Heading level="4" size="small" id="hoveddiagnose-section-heading">
                Hoveddiagnose
            </Heading>
            <DiagnosePicker />
            {children}
        </section>
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
