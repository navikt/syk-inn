import { Alert, BodyShort, Button, Detail, FormSummary, Heading } from '@navikt/ds-react'
import React, { ReactElement } from 'react'
import { PaperplaneIcon } from '@navikt/aksel-icons'

import { toReadableDate, toReadableDatePeriod } from '@utils/date'
import { usePersonQuery } from '@data-layer/data-fetcher/hooks/use-person-query'

import { useFormStep } from '../steps/useFormStep'
import { useAppSelector } from '../../../providers/redux/hooks'
import { useNySykmeldingMutation } from '../useNySykmeldingMutation'
import {
    AktivitetStep,
    DiagnoseStep,
    PasientStep,
    TilbakedateringStep,
} from '../../../providers/redux/reducers/ny-sykmelding-multistep'

import { aktivitetDescription } from './summary-text-utils'

function SummarySection(): ReactElement {
    const [, setStep] = useFormStep()
    const formState = useAppSelector((state) => state.nySykmeldingMultistep)
    const nySykmelding = useNySykmeldingMutation()

    return (
        <div className="flex flex-col gap-6 mt-8">
            <Heading size="medium" level="3">
                Oppsummering sykmelding
            </Heading>
            <FormSummary>
                <FormSummary.Header>
                    <FormSummary.Heading level="2">Pasientopplysninger</FormSummary.Heading>
                </FormSummary.Header>

                <PatientSummaryAnswers pasient={formState.pasient} />
            </FormSummary>

            <FormSummary>
                <FormSummary.Header>
                    <FormSummary.Heading level="2">Periode og grad</FormSummary.Heading>
                    <FormSummary.EditLink as="button" onClick={() => setStep('main')} />
                </FormSummary.Header>

                <AktivitetSummaryAnswers aktiviteter={formState.aktiviteter} />
            </FormSummary>
            {formState.tilbakedatering && (
                <FormSummary>
                    <FormSummary.Header>
                        <FormSummary.Heading level="2">Tilbakedatering</FormSummary.Heading>
                        <FormSummary.EditLink as="button" onClick={() => setStep('main')} />
                    </FormSummary.Header>
                    <TilbakedateringSummaryAnswers tilbakedatering={formState.tilbakedatering} />
                </FormSummary>
            )}
            <FormSummary>
                <FormSummary.Header>
                    <FormSummary.Heading level="2">Diagnose</FormSummary.Heading>
                    <FormSummary.EditLink as="button" onClick={() => setStep('main')} />
                </FormSummary.Header>

                <DiagnoseSummaryAnswers diagnose={formState.diagnose} />
            </FormSummary>

            <FormSummary>
                <FormSummary.Header>
                    <FormSummary.Heading level="2">Meldinger</FormSummary.Heading>
                    <FormSummary.EditLink as="button" onClick={() => setStep('main')} />
                </FormSummary.Header>

                <FormSummary.Answers>
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
                </FormSummary.Answers>
            </FormSummary>

            <FormSummary>
                <FormSummary.Header>
                    <FormSummary.Heading level="2">Andre spørsmål</FormSummary.Heading>
                    <FormSummary.EditLink as="button" onClick={() => setStep('main')} />
                </FormSummary.Header>

                <FormSummary.Answers>
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

            <div className="w-full flex justify-end gap-3 mt-16">
                <Button
                    type="button"
                    variant="secondary"
                    onClick={() => setStep('main')}
                    disabled={nySykmelding.isPending}
                >
                    Forrige steg
                </Button>
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
            </div>

            {nySykmelding.error && (
                <Alert variant="error">Det skjedde en feil under innsending av sykmeldingen. Prøv igjen senere.</Alert>
            )}
        </div>
    )
}

function AktivitetSummaryAnswers({ aktiviteter }: { aktiviteter: AktivitetStep[] | null }): ReactElement {
    if (aktiviteter == null) {
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
        <>
            {aktiviteter.map((aktivitet, index) => (
                <FormSummary.Answers key={index}>
                    <FormSummary.Answer>
                        <FormSummary.Label>Periode</FormSummary.Label>
                        <FormSummary.Value>{toReadableDatePeriod(aktivitet.fom, aktivitet.tom)}</FormSummary.Value>
                    </FormSummary.Answer>
                    <FormSummary.Answer>
                        <FormSummary.Label>Mulighet for arbied</FormSummary.Label>
                        <FormSummary.Value>{aktivitetDescription(aktivitet)}</FormSummary.Value>
                    </FormSummary.Answer>
                </FormSummary.Answers>
            ))}
        </>
    )
}

function TilbakedateringSummaryAnswers({ tilbakedatering }: { tilbakedatering: TilbakedateringStep }): ReactElement {
    return (
        <FormSummary.Answers>
            <FormSummary.Answer>
                <FormSummary.Label>Dato for tilbakedatering</FormSummary.Label>
                <FormSummary.Value>{toReadableDate(tilbakedatering.fom)}</FormSummary.Value>
            </FormSummary.Answer>
            <FormSummary.Answer>
                <FormSummary.Label>Grunn for tilbakedatering</FormSummary.Label>
                <FormSummary.Value>{tilbakedatering.grunn}</FormSummary.Value>
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
    // TODO: This is only example usage of usage of person query, not part of current design
    const personQuery = usePersonQuery(pasient?.ident ?? null)

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
                {personQuery.data?.navn && (
                    <FormSummary.Value>({personQuery.data?.navn} i folkeregisteret)</FormSummary.Value>
                )}
            </FormSummary.Answer>
            <FormSummary.Answer>
                <FormSummary.Label>Fødselsnummer</FormSummary.Label>
                <FormSummary.Value>{pasient.ident}</FormSummary.Value>
                {personQuery.data?.ident && (
                    <FormSummary.Value>({personQuery.data?.ident} i folkeregisteret)</FormSummary.Value>
                )}
            </FormSummary.Answer>
        </FormSummary.Answers>
    )
}

export default SummarySection
