import { Alert, BodyShort, Button, Checkbox, Detail, FormSummary, Heading } from '@navikt/ds-react'
import React, { ReactElement } from 'react'
import { PaperplaneIcon } from '@navikt/aksel-icons'
import { AnimatePresence } from 'motion/react'

import { toReadableDate, toReadableDatePeriod } from '@utils/date'
import { SimpleReveal } from '@components/animation/Reveal'

import { useFormStep } from '../steps/useFormStep'
import { useAppDispatch, useAppSelector } from '../../../providers/redux/hooks'
import { useOpprettSykmeldingMutation } from '../useOpprettSykmeldingMutation'
import {
    AktivitetStep,
    DiagnoseStep,
    nySykmeldingMultistepActions,
    PasientStep,
    TilbakedateringStep,
} from '../../../providers/redux/reducers/ny-sykmelding-multistep'

import { aktivitetDescription } from './summary-text-utils'

function SummarySection(): ReactElement {
    const [, setStep] = useFormStep()
    const formState = useAppSelector((state) => state.nySykmeldingMultistep)
    const nySykmelding = useOpprettSykmeldingMutation()
    const dispatch = useAppDispatch()

    return (
        <div className="flex flex-col gap-6 mt-8">
            <FormSummary>
                <FormSummary.Header>
                    <FormSummary.Heading level="2">Oppsummering sykmelding</FormSummary.Heading>
                    <FormSummary.EditLink as="button" onClick={() => setStep('main')} />
                </FormSummary.Header>
                <FormSummary.Answers>
                    <PatientSummaryAnswers pasient={formState.pasient} />
                    <AktivitetSummaryAnswers aktiviteter={formState.aktiviteter} />
                    {formState.tilbakedatering && (
                        <TilbakedateringSummaryAnswers tilbakedatering={formState.tilbakedatering} />
                    )}
                    <DiagnoseSummaryAnswers diagnose={formState.diagnose} />

                    <FormSummary.Answer>
                        <FormSummary.Label>Til NAV</FormSummary.Label>
                        {formState.meldinger?.tilNav ? (
                            <FormSummary.Value>{formState.meldinger?.tilNav}</FormSummary.Value>
                        ) : (
                            <FormSummary.Value className="italic">Ingen melding</FormSummary.Value>
                        )}
                    </FormSummary.Answer>
                    <FormSummary.Answer>
                        <FormSummary.Label>Til arbeidsgiver</FormSummary.Label>
                        {formState.meldinger?.tilArbeidsgiver ? (
                            <FormSummary.Value>{formState.meldinger?.tilArbeidsgiver}</FormSummary.Value>
                        ) : (
                            <FormSummary.Value className="italic">Ingen melding</FormSummary.Value>
                        )}
                    </FormSummary.Answer>

                    <FormSummary.Answer>
                        <FormSummary.Label>Svangerskapsrelatert</FormSummary.Label>
                        {formState.andreSporsmal?.svangerskapsrelatert ? (
                            <FormSummary.Value>Ja</FormSummary.Value>
                        ) : (
                            <FormSummary.Value>Nei</FormSummary.Value>
                        )}
                    </FormSummary.Answer>
                    <FormSummary.Answer>
                        <FormSummary.Label>Yrkesskade</FormSummary.Label>
                        {formState.andreSporsmal?.yrkesskade ? (
                            <FormSummary.Value>Ja</FormSummary.Value>
                        ) : (
                            <FormSummary.Value>Nei</FormSummary.Value>
                        )}
                    </FormSummary.Answer>
                </FormSummary.Answers>
            </FormSummary>

            <Checkbox
                value={formState.skalSkjermes ?? false}
                onChange={(e) => dispatch(nySykmeldingMultistepActions.setSkalSkjermes(e.target.checked))}
            >
                <option>Pasienten skal skjermes for medisinske opplysninger</option>
            </Checkbox>

            <AnimatePresence>
                {nySykmelding.result?.data?.opprettSykmelding.__typename === 'OpprettSykmeldingRuleOutcome' && (
                    <SimpleReveal>
                        <Alert variant="warning">
                            <Heading size="medium" level="3" spacing>
                                Sykmeldingen ble ikke sendt inn på grunn av regelsjekk
                            </Heading>
                            <BodyShort spacing>
                                Sykmeldingen ble fylt ut rett, men den traff på en regel som gjorde at sykmeldingen ikke
                                ville blitt godkjent hos Nav.
                            </BodyShort>
                            <BodyShort>
                                Teknisk regelnavn:{' '}
                                <pre>
                                    {nySykmelding.result.data.opprettSykmelding.tree} -{' '}
                                    {nySykmelding.result.data.opprettSykmelding.rule}
                                </pre>
                            </BodyShort>
                        </Alert>
                    </SimpleReveal>
                )}
            </AnimatePresence>

            <div className="w-full flex justify-end gap-3 mt-16">
                <Button
                    type="button"
                    variant="secondary"
                    onClick={() => setStep('main')}
                    disabled={nySykmelding.result.loading}
                >
                    Forrige steg
                </Button>
                <Button
                    type="button"
                    variant="primary"
                    icon={<PaperplaneIcon aria-hidden />}
                    iconPosition="right"
                    loading={nySykmelding.result.loading}
                    onClick={() => nySykmelding.opprettSykmelding()}
                >
                    Send inn
                </Button>
            </div>

            {nySykmelding.result.error && (
                <Alert variant="error">Det skjedde en feil under innsending av sykmeldingen. Prøv igjen senere.</Alert>
            )}
        </div>
    )
}

function AktivitetSummaryAnswers({ aktiviteter }: { aktiviteter: AktivitetStep[] | null }): ReactElement {
    if (aktiviteter == null) {
        return (
            <FormSummary.Answer>
                <Alert variant="warning">
                    Denne delen av sykmeldingen er ikke utfylt. Gå tilbake og fyll ut for å sende inn.
                </Alert>
            </FormSummary.Answer>
        )
    }

    return (
        <>
            {aktiviteter.map((aktivitet, index) => (
                <React.Fragment key={index}>
                    <FormSummary.Answer>
                        <FormSummary.Label>Periode</FormSummary.Label>
                        <FormSummary.Value>{toReadableDatePeriod(aktivitet.fom, aktivitet.tom)}</FormSummary.Value>
                    </FormSummary.Answer>
                    <FormSummary.Answer>
                        <FormSummary.Label>Mulighet for arbeid</FormSummary.Label>
                        <FormSummary.Value>{aktivitetDescription(aktivitet)}</FormSummary.Value>
                    </FormSummary.Answer>
                </React.Fragment>
            ))}
        </>
    )
}

function TilbakedateringSummaryAnswers({ tilbakedatering }: { tilbakedatering: TilbakedateringStep }): ReactElement {
    return (
        <>
            <FormSummary.Answer>
                <FormSummary.Label>Dato for tilbakedatering</FormSummary.Label>
                <FormSummary.Value>{toReadableDate(tilbakedatering.fom)}</FormSummary.Value>
            </FormSummary.Answer>
            <FormSummary.Answer>
                <FormSummary.Label>Grunn for tilbakedatering</FormSummary.Label>
                <FormSummary.Value>{tilbakedatering.grunn}</FormSummary.Value>
            </FormSummary.Answer>
        </>
    )
}

function DiagnoseSummaryAnswers({ diagnose }: { diagnose: DiagnoseStep | null }): ReactElement {
    if (diagnose == null) {
        return (
            <FormSummary.Answers>
                <FormSummary.Answer>
                    <Alert variant="warning">
                        Denne delen av sykmeldingen er ikke utfylt. Gå tilbake og fyll ut for å sende inn.
                    </Alert>
                </FormSummary.Answer>
            </FormSummary.Answers>
        )
    }

    return (
        <FormSummary.Answer>
            <FormSummary.Label>Hoveddiagnose</FormSummary.Label>
            <FormSummary.Value>
                <BodyShort>
                    {diagnose.hoved.text} ({diagnose.hoved.code})
                </BodyShort>
                <Detail>{diagnose.hoved.system}</Detail>
            </FormSummary.Value>
        </FormSummary.Answer>
    )
}

function PatientSummaryAnswers({ pasient }: { pasient: PasientStep | null }): ReactElement {
    if (pasient == null) {
        return (
            <FormSummary.Answer>
                <Alert variant="warning">
                    Denne delen av sykmeldingen er ikke utfylt. Gå tilbake og fyll ut for å sende inn.
                </Alert>
            </FormSummary.Answer>
        )
    }

    return (
        <>
            <FormSummary.Answer>
                <FormSummary.Label>Navn</FormSummary.Label>
                <FormSummary.Value>{pasient.navn}</FormSummary.Value>
            </FormSummary.Answer>
            <FormSummary.Answer>
                <FormSummary.Label>Fødselsnummer</FormSummary.Label>
                <FormSummary.Value>{pasient.ident}</FormSummary.Value>
            </FormSummary.Answer>
        </>
    )
}

export default SummarySection
