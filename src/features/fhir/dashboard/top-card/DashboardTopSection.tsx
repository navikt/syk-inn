import { useQuery } from '@apollo/client/react'
import { Checkbox, Heading } from '@navikt/ds-react'
import { parseAsBoolean, useQueryState } from 'nuqs'
import React, { ReactElement, useEffect } from 'react'

import { useAppDispatch } from '#core/redux/hooks'
import { nySykmeldingActions } from '#core/redux/reducers/ny-sykmelding'
import { cn } from '#lib/tw'
import { PasientDocument } from '#queries'

import { DashboardSection } from '../card/DashboardSection'
import { InfoNySykmeldingButton } from '../welcome-modal/InfoNySykmeldingButton'

import { PatientStats } from './dumb-stats/PatientStats'
import { StartSykmelding } from './StartSykmelding'

export function DashboardTopSection({ className }: { className?: string }): ReactElement {
    const [isKnown, setIsKnown] = useQueryState('known', parseAsBoolean.withDefault(true))
    const { data, loading } = useQuery(PasientDocument)
    const dispatch = useAppDispatch()

    useEffect(() => {
        /**
         * Make sure form is reset for next sykmelding.
         *
         * If user returns to a ID it should be loaded from the draft, and any new ID should start with a fresh form.
         */
        dispatch(nySykmeldingActions.reset())
    }, [dispatch])

    return (
        <DashboardSection
            ariaLabel={`Oversikt over ${data?.pasient?.navn} sitt sykefravær`}
            className={cn(className)}
            ariaBusy={loading}
        >
            <div className="flex items-start sm:items-center sm:gap-6 sm:mb-4 sm:flex-row flex-col">
                <Heading level="2" size="xsmall">
                    Pasientopplysninger
                </Heading>
                <Checkbox checked={isKnown} onChange={() => setIsKnown((x) => !x)} size="small">
                    Pasienten er kjent eller har vist legitimasjon
                </Checkbox>
                <InfoNySykmeldingButton className="absolute right-2 top-2 sm:static" />
            </div>
            <StartSykmelding className="col-start-1 row-start-1" />
            <div className="border-b border-ax-border-neutral-subtle -mx-6 my-6" />
            <PatientStats />
        </DashboardSection>
    )
}
