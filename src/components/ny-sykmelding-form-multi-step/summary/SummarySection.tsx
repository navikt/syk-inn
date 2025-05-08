import { Alert, BodyShort, Button, Detail, FormSummary } from '@navikt/ds-react'
import React, { ReactElement } from 'react'
import { PaperplaneIcon } from '@navikt/aksel-icons'

import { toReadableDatePeriod } from '@utils/date'

import { useFormStep } from '../steps/useFormStep'
import { ButtonsGroup, PreviousStepButton } from '../steps/StepNavigation'
import { useAppSelector } from '../../../providers/redux/hooks'
import { useNySykmeldingMutation } from '../useNySykmeldingMutation'
import { AktivitetStep, DiagnoseStep, PasientStep } from '../../../providers/redux/reducers/ny-sykmelding-multistep'

import { aktivitetDescription } from './summary-text-utils'

function SummarySection(): ReactElement {
    const [, setStep] = useFormStep()
    const formState = useAppSelector((state) => state.nySykmeldingMultistep)
    const nySykmelding = useNySykmeldingMutation()

    return (
        <div className="flex flex-col gap-6 mt-8">
            <FormSummary>
                <FormSummary.Header>
                    <FormSummary.Heading level="2">Pasientopplysninger</FormSummary.Heading>
                </FormSummary.Header>

                <PatientSummaryAnswers pasient={formState.pasient} />
            </FormSummary>

            <FormSummary>
                <FormSummary.Header>
                    <FormSummary.Heading level="2">Periode og grad</FormSummary.Heading>
                    <FormSummary.EditLink as="button" onClick={() => setStep(1)} />
                </FormSummary.Header>

                <AktivitetSummaryAnswers aktivitet={formState.aktivitet} />
            </FormSummary>
            <FormSummary>
                <FormSummary.Header>
                    <FormSummary.Heading level="2">Diagnose</FormSummary.Heading>
                    <FormSummary.EditLink as="button" onClick={() => setStep(2)} />
                </FormSummary.Header>

                <DiagnoseSummaryAnswers diagnose={formState.diagnose} />
            </FormSummary>

            <ButtonsGroup>
                <PreviousStepButton onClick={() => setStep(2)} disabled={nySykmelding.isPending} />
                <Button
                    type="button"
                    variant="primary"
                    icon={<PaperplaneIcon aria-hidden />}
                    iconPosition="right"
                    loading={nySykmelding.isPending}
                    onClick={() => nySykmelding.mutate()}
                >
                    Send inn
                </Button>
            </ButtonsGroup>

            {nySykmelding.error && (
                <Alert variant="error">Det skjedde en feil under innsending av sykmeldingen. Prøv igjen senere.</Alert>
            )}
        </div>
    )
}

function AktivitetSummaryAnswers({ aktivitet }: { aktivitet: AktivitetStep | null }): ReactElement {
    if (aktivitet == null) {
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
        <FormSummary.Answers>
            <FormSummary.Answer>
                <FormSummary.Label>Periode</FormSummary.Label>
                <FormSummary.Value>{toReadableDatePeriod(aktivitet.fom, aktivitet.tom)}</FormSummary.Value>
            </FormSummary.Answer>
            <FormSummary.Answer>
                <FormSummary.Label>Mulighet for arbied</FormSummary.Label>
                <FormSummary.Value>{aktivitetDescription(aktivitet)}</FormSummary.Value>
            </FormSummary.Answer>
        </FormSummary.Answers>
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
        <FormSummary.Answers>
            <FormSummary.Answer>
                <FormSummary.Label>Hoveddiagnose</FormSummary.Label>
                <FormSummary.Value>
                    <BodyShort>
                        {diagnose.hoved.text} ({diagnose.hoved.code})
                    </BodyShort>
                    <Detail>{diagnose.hoved.system}</Detail>
                </FormSummary.Value>
            </FormSummary.Answer>
        </FormSummary.Answers>
    )
}

function PatientSummaryAnswers({ pasient }: { pasient: PasientStep | null }): ReactElement {
    if (pasient == null) {
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
        <FormSummary.Answers>
            <FormSummary.Answer>
                <FormSummary.Label>Navn</FormSummary.Label>
                <FormSummary.Value>{pasient.navn}</FormSummary.Value>
            </FormSummary.Answer>
            <FormSummary.Answer>
                <FormSummary.Label>Fødselsnummer</FormSummary.Label>
                <FormSummary.Value>{pasient.fnr}</FormSummary.Value>
            </FormSummary.Answer>
        </FormSummary.Answers>
    )
}

export default SummarySection
