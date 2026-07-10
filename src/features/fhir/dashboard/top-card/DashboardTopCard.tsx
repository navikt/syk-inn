import { useQuery } from '@apollo/client/react'
import { Checkbox, Heading } from '@navikt/ds-react'
import { parseAsBoolean, useQueryState } from 'nuqs'
import React, { ReactElement, useEffect } from 'react'

import { useAppDispatch } from '#core/redux/hooks'
import { nySykmeldingActions } from '#core/redux/reducers/ny-sykmelding'
import { cn } from '#lib/tw'
import { PasientDocument } from '#queries'

import { DashboardCard } from '../card/DashboardCard'
import { InfoNySykmeldingButton } from '../welcome-modal/InfoNySykmeldingButton'

import { PatientStats } from './dumb-stats/PatientStats'
import { StartSykmelding } from './StartSykmelding'

export function DashboardTopCard({ className }: { className?: string }): ReactElement {
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
        <DashboardCard
            ariaLabel={`Oversikt over ${data?.pasient?.navn} sitt sykefravær`}
            className={cn(className)}
            ariaBusy={loading}
        >
            <div className="flex items-center gap-6 mb-4">
                <Heading level="2" size="xsmall">
                    Pasientopplysninger
                </Heading>
                <Checkbox checked={isKnown} onChange={() => setIsKnown((x) => !x)} size="small">
                    Pasienten er kjent eller har vist legitimasjon
                </Checkbox>
                <InfoNySykmeldingButton />
            </div>
            <div className={cn('grid grid-cols-1 md:grid-cols-2 gap-5 space-x-0 divide-ax-bg-neutral-soft')}>
                <StartSykmelding className="col-start-1 row-start-1" />
                <div className="col-start-1 row-start-1 justify-self-end w-1 mt-2 mb-2 mx-2 ax-lg:mx-8 bg-ax-bg-neutral-soft shrink-0 self-stretch hidden ax-md:block" />
                <PatientStats />
            </div>
        </DashboardCard>
    )
}
