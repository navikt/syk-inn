import { Alert, BodyShort, Detail, FormSummary } from '@navikt/ds-react'
import React, { ReactElement } from 'react'

import { useFormStep } from '@components/ny-sykmelding-form/steps/useFormStep'
import { toReadableDate, toReadableDatePeriod } from '@utils/date'

import { useAppSelector } from '../../../providers/redux/hooks'
import {
    AktivitetStep,
    DiagnoseStep,
    PasientStep,
    TilbakedateringStep,
} from '../../../providers/redux/reducers/ny-sykmelding-multistep'

import { aktivitetDescription } from './summary-text-utils'

type Props = {
    className?: string
}

function FormValuesSummary({ className }: Props): ReactElement {
    const [, setStep] = useFormStep()
    const formState = useAppSelector((state) => state.nySykmeldingMultistep)

    return (
        <div className={className}>
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
        </div>
    )
}

function AktivitetSummaryAnswers({ aktiviteter }: { aktiviteter: AktivitetStep[] | null }): ReactElement {
    if (aktiviteter == null) {
        return (
            <FormSummary.Answer>
                <FormSummary.Label>Periode</FormSummary.Label>
                <FormSummary.Value>
                    <Alert variant="warning">
                        Denne delen av sykmeldingen er ikke utfylt. Gå tilbake og fyll ut for å sende inn.
                    </Alert>
                </FormSummary.Value>
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
            <FormSummary.Answer>
                <FormSummary.Label>Hoveddiagnose</FormSummary.Label>
                <FormSummary.Value>
                    <Alert variant="warning">
                        Denne delen av sykmeldingen er ikke utfylt. Gå tilbake og fyll ut for å sende inn.
                    </Alert>
                </FormSummary.Value>
            </FormSummary.Answer>
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
                <FormSummary.Label>Navn</FormSummary.Label>
                <FormSummary.Value>
                    <Alert variant="warning">
                        Denne delen av sykmeldingen er ikke utfylt. Gå tilbake og fyll ut for å sende inn.
                    </Alert>
                </FormSummary.Value>
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

export default FormValuesSummary
