import React, { CSSProperties, ReactElement, useEffect, useState } from 'react'
import { Alert, BodyShort, Button, Checkbox, Detail, Heading, Skeleton } from '@navikt/ds-react'
import { useQuery } from '@apollo/client/react'

import { cn } from '@lib/tw'
import { PasientDocument } from '@queries'
import { ShortcutButtonLink } from '@components/shortcut/ShortcutButtons'
import { useAppDispatch } from '@core/redux/hooks'
import { nySykmeldingActions } from '@core/redux/reducers/ny-sykmelding'
import { LoadablePageHeader } from '@components/layout/Page'

import DumbStats from './dumb-stats/DumbStats'
import DashboardCard from './card/DashboardCard'

function OpprettNySykmeldingCard({ className }: { className?: string }): ReactElement {
    const { data, loading, error, refetch } = useQuery(PasientDocument)
    const [hasLegged, setHasLegged] = useState(true)
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
            headingId="dashboard-opprett-ny-sykmelding"
            heading={
                <LoadablePageHeader
                    id="dashboard-opprett-ny-sykmelding"
                    lead="Oversikt over"
                    value={data?.pasient?.navn ?? null}
                    tail="sitt sykefravær"
                />
            }
            className={cn(className)}
        >
            <div className="flex gap-3">
                <div className="pr-16">
                    <Heading size="small" level="3">
                        Pasientopplysninger
                    </Heading>
                    <Detail>Denne sykmeldingen opprettes for følgende person</Detail>
                    {loading && (
                        <div className="flex gap-6 mt-3 mb-2">
                            <div className="min-w-32">
                                <Skeleton width={120} />
                                <Skeleton width={120} />
                            </div>
                            <div>
                                <Skeleton width={120} />
                                <Skeleton width={120} />
                            </div>
                        </div>
                    )}
                    {error && (
                        <Alert variant="error">
                            <BodyShort>Kunne ikke hente pasientopplysninger</BodyShort>
                            <Button size="xsmall" onClick={() => refetch()}>
                                Prøv på nytt
                            </Button>
                        </Alert>
                    )}
                    {!loading && data?.pasient && (
                        <div className="flex gap-6 mt-3">
                            <div className="min-w-32">
                                <Detail className="font-bold">Navn</Detail>
                                <BodyShort spacing>{data.pasient.navn ?? 'Navn mangler'}</BodyShort>
                            </div>
                            <div>
                                <Detail className="font-bold">ID-nummer</Detail>
                                <BodyShort spacing>{data.pasient.ident}</BodyShort>
                            </div>
                        </div>
                    )}

                    <div className="flex flex-col gap-3">
                        <div
                            className="grow"
                            style={
                                {
                                    '--ac-confirmation-panel-checked-bg': 'transparent',
                                    '--ac-confirmation-panel-checked-border': 'transparent',
                                } as CSSProperties
                            }
                        >
                            <Checkbox
                                checked={hasLegged}
                                onChange={() => setHasLegged((x) => !x)}
                                size="small"
                                className="p-4 pl-0"
                            >
                                Pasienten er kjent eller har vist legitimasjon
                            </Checkbox>
                        </div>

                        <ShortcutButtonLink
                            href="/fhir/ny"
                            variant="primary"
                            disabled={loading || !hasLegged}
                            loading={loading}
                            size="medium"
                            shortcut={{
                                modifier: 'alt',
                                key: 'n',
                            }}
                        >
                            Opprett sykmelding
                        </ShortcutButtonLink>
                    </div>
                </div>
                <div className="w-1 -mt-2 mb-2 mx-8 bg-bg-subtle self-stretch"></div>
                <DumbStats />
            </div>
        </DashboardCard>
    )
}

export default OpprettNySykmeldingCard
