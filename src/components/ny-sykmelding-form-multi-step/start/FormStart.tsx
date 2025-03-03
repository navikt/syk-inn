import React, { CSSProperties, ReactElement, useEffect, useState } from 'react'
import { BodyLong, BodyShort, Button, ConfirmationPanel, Detail, GuidePanel, Heading, Skeleton } from '@navikt/ds-react'
import { List, ListItem } from '@navikt/ds-react/List'
import { ArrowRightIcon } from '@navikt/aksel-icons'

import { useContextPasient } from '../../../data-fetcher/hooks/use-context-pasient'
import { useAppDispatch } from '../../../providers/redux/hooks'
import { nySykmeldingMultistepActions } from '../../../providers/redux/reducers/ny-sykmelding-multistep'
import { useFormStep } from '../steps/useFormStep'

function FormStart(): ReactElement {
    const [, setStep] = useFormStep()
    const { data: pasient, isLoading } = useContextPasient()
    const dispatch = useAppDispatch()
    const startRef = React.useRef<HTMLButtonElement>(null)

    const [hasLegged, setHasLegged] = useState(true)

    useEffect(() => {
        if (pasient != null && !isLoading) {
            startRef.current?.focus()
        }
    }, [pasient, isLoading])

    useEffect(() => {
        if (pasient != null && !isLoading) {
            dispatch(
                nySykmeldingMultistepActions.autoPatient({
                    type: 'auto',
                    fnr: pasient.ident,
                    navn: pasient.navn,
                }),
            )
        }
    }, [dispatch, isLoading, pasient])

    return (
        <div className="flex flex-col gap-6">
            <GuidePanel poster>
                <BodyLong>
                    Her kan du opprette en sykmelding for pasienten. Du vil få hjelp underveis i skjemaet dersom noe
                    mangler, eller om du gjør noe som vil bli avvist etter innsending.
                </BodyLong>
            </GuidePanel>
            <List
                as="ul"
                title="Krav om sykmeldingen i pilot-fase"
                description="Nå i pilot-fasen støtter vi kun enkle sykmeldinger, som oppfyller et sett med krav"
            >
                <ListItem>Det må være en førstegangssykmelding</ListItem>
                <ListItem>Den sykmeldte må ha kun en hoveddiagnose, ingen bi-diagnoser</ListItem>
                <ListItem>Det må kun være èn periode, enten 100% eller gradert sykmelding</ListItem>
            </List>
            <div>
                <Heading size="small" level="3">
                    Pasient
                </Heading>
                <BodyShort>Denne sykmeldingen opprettes for følgende person</BodyShort>
                {isLoading && (
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
                {!isLoading && pasient && (
                    <div className="flex gap-6 mt-3">
                        <div className="min-w-32">
                            <Detail>Navn</Detail>
                            <BodyShort spacing>{pasient.navn}</BodyShort>
                        </div>
                        <div>
                            <Detail>ID-nummer</Detail>
                            <BodyShort spacing>{pasient.ident}</BodyShort>
                        </div>
                    </div>
                )}
            </div>

            <div
                style={
                    {
                        '--ac-confirmation-panel-checked-bg': 'white',
                        '--ac-confirmation-panel-checked-border': 'var(--a-border-subtle)',
                    } as CSSProperties
                }
            >
                <ConfirmationPanel
                    checked={hasLegged}
                    label="Pasienten er kjent eller har vist legitimasjon"
                    onChange={() => setHasLegged((x) => !x)}
                    size="small"
                />
            </div>

            <div className="flex gap-3 mt-8">
                <Button
                    ref={startRef}
                    variant="primary"
                    icon={<ArrowRightIcon aria-hidden />}
                    iconPosition="right"
                    onClick={() => setStep(2)}
                    disabled={isLoading || !hasLegged}
                    loading={isLoading}
                >
                    Start sykmelding
                </Button>
            </div>
        </div>
    )
}

export default FormStart
