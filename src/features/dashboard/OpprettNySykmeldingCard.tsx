import React, { CSSProperties, ReactElement, useEffect, useState } from 'react'
import { Alert, BodyShort, Button, Checkbox, Detail, Heading, Skeleton } from '@navikt/ds-react'
import { useQuery } from '@apollo/client/react'

import { cn } from '@lib/tw'
import { PasientDocument } from '@queries'
import { ShortcutButtonLink } from '@components/shortcut/ShortcutButtons'
import { useAppDispatch } from '@core/redux/hooks'
import { nySykmeldingActions } from '@core/redux/reducers/ny-sykmelding'

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
        <DashboardCard title="Opprett ny sykmelding" className={cn(className)}>
            <div className="flex gap-3">
                <div>
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
                                <Detail>Navn</Detail>
                                <BodyShort spacing>{data.pasient.navn ?? 'Navn mangler'}</BodyShort>
                            </div>
                            <div>
                                <Detail>ID-nummer</Detail>
                                <BodyShort spacing>{data.pasient.ident}</BodyShort>
                            </div>
                        </div>
                    )}

                    <div>
                        <Heading size="small" level="3">
                            Bekreftelse
                        </Heading>
                        <div className="flex flex-row gap-3">
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
                                    className="p-4"
                                >
                                    Pasienten er kjent eller har vist legitimasjon
                                </Checkbox>
                            </div>

                            <div className="flex items-center justify-end">
                                <ShortcutButtonLink
                                    href="/fhir/ny"
                                    variant="primary"
                                    disabled={loading || !hasLegged}
                                    loading={loading}
                                    size="small"
                                    shortcut={{
                                        modifier: 'alt',
                                        key: 'n',
                                    }}
                                >
                                    Opprett sykmelding
                                </ShortcutButtonLink>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="w-1 -mt-2 mb-2 mx-8 bg-bg-subtle self-stretch"></div>
                <DumbStats />
            </div>
        </DashboardCard>
    )
}

export default OpprettNySykmeldingCard
