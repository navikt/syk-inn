import { Alert, BodyShort, Detail, FormSummary } from '@navikt/ds-react'
import React, { ReactElement } from 'react'
import * as R from 'remeda'

import { toReadableDate, toReadableDatePeriod } from '@lib/date'
import { useAppSelector } from '@core/redux/hooks'
import {
    AktivitetStep,
    DiagnoseStep,
    PasientStep,
    TilbakedateringGrunn,
    TilbakedateringStep,
} from '@core/redux/reducers/ny-sykmelding-multistep'

import { ArbeidsrelaterteArsaker } from '../aktivitet/ArsakerPicker'
import { useFormStep } from '../steps/useFormStep'

import { aktivitetDescription } from './summary-text-utils'

type Props = {
    className?: string
}

function FormValuesSummary({ className }: Props): ReactElement {
    const [, setStep] = useFormStep()
    const { pasient, values } = useAppSelector((state) => state.nySykmeldingMultistep)

    return (
        <div className={className}>
            <FormSummary>
                <FormSummary.Header>
                    <FormSummary.Heading level="2">Oppsummering sykmelding</FormSummary.Heading>
                    <FormSummary.EditLink as="button" onClick={() => setStep('main')} />
                </FormSummary.Header>
                <FormSummary.Answers>
                    <PatientSummaryAnswers pasient={pasient} />
                    <FormSummary.Answer>
                        <FormSummary.Label>Har pasienten flere arbeidsforhold?</FormSummary.Label>
                        <FormSummary.Value>
                            {values?.arbeidsforhold?.harFlereArbeidsforhold ? 'Ja' : 'Nei'}
                        </FormSummary.Value>
                    </FormSummary.Answer>
                    {values?.arbeidsforhold?.harFlereArbeidsforhold && (
                        <FormSummary.Answer>
                            <FormSummary.Label>Hvilke arbeidsforhold skal pasienten sykmeldes fra?</FormSummary.Label>
                            <FormSummary.Value>{values?.arbeidsforhold?.sykmeldtFraArbeidsforhold}</FormSummary.Value>
                        </FormSummary.Answer>
                    )}
                    <AktivitetSummaryAnswers aktiviteter={values?.aktiviteter ?? null} />
                    {values?.tilbakedatering && (
                        <TilbakedateringSummaryAnswers tilbakedatering={values?.tilbakedatering} />
                    )}
                    <DiagnoseSummaryAnswers diagnose={values?.diagnose ?? null} />

                    <FormSummary.Answer>
                        <FormSummary.Label>Til NAV</FormSummary.Label>
                        {values?.meldinger?.tilNav ? (
                            <FormSummary.Value>{values?.meldinger?.tilNav}</FormSummary.Value>
                        ) : (
                            <FormSummary.Value className="italic">Ingen melding</FormSummary.Value>
                        )}
                    </FormSummary.Answer>
                    <FormSummary.Answer>
                        <FormSummary.Label>Til arbeidsgiver</FormSummary.Label>
                        {values?.meldinger?.tilArbeidsgiver ? (
                            <FormSummary.Value>{values?.meldinger?.tilArbeidsgiver}</FormSummary.Value>
                        ) : (
                            <FormSummary.Value className="italic">Ingen melding</FormSummary.Value>
                        )}
                    </FormSummary.Answer>

                    <FormSummary.Answer>
                        <FormSummary.Label>Svangerskapsrelatert</FormSummary.Label>
                        {values?.andreSporsmal?.svangerskapsrelatert ? (
                            <FormSummary.Value>Ja</FormSummary.Value>
                        ) : (
                            <FormSummary.Value>Nei</FormSummary.Value>
                        )}
                    </FormSummary.Answer>
                    <FormSummary.Answer>
                        <FormSummary.Label>Yrkesskade</FormSummary.Label>
                        {values?.andreSporsmal?.yrkesskade ? (
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
                        {aktivitet.tom != null ? (
                            <FormSummary.Value>{toReadableDatePeriod(aktivitet.fom, aktivitet.tom)}</FormSummary.Value>
                        ) : (
                            <FormSummary.Value>
                                <Alert variant="warning">Periode mangler datoer.</Alert>
                            </FormSummary.Value>
                        )}
                    </FormSummary.Answer>
                    <FormSummary.Answer>
                        <FormSummary.Label>Mulighet for arbeid</FormSummary.Label>
                        <FormSummary.Value>{aktivitetDescription(aktivitet)}</FormSummary.Value>
                    </FormSummary.Answer>
                    {aktivitet.type === 'AKTIVITET_IKKE_MULIG' && (
                        <>
                            <FormSummary.Answer>
                                <FormSummary.Label>Medisinsk årsak</FormSummary.Label>
                                <FormSummary.Value>
                                    {aktivitet.medisinskArsak.isMedisinskArsak ? 'Ja' : 'Nei'}
                                </FormSummary.Value>
                            </FormSummary.Answer>
                            <FormSummary.Answer>
                                <FormSummary.Label>Arbeidsrelatert årsak</FormSummary.Label>
                                <FormSummary.Value>
                                    {aktivitet.arbeidsrelatertArsak.isArbeidsrelatertArsak ? 'Ja' : 'Nei'}
                                </FormSummary.Value>
                            </FormSummary.Answer>
                            {aktivitet.arbeidsrelatertArsak.isArbeidsrelatertArsak && (
                                <>
                                    <FormSummary.Answer>
                                        <FormSummary.Label>Arbeidsrelaterte årsaker</FormSummary.Label>
                                        <FormSummary.Value>
                                            {aktivitet.arbeidsrelatertArsak.arbeidsrelaterteArsaker
                                                ?.map((arsak) => ArbeidsrelaterteArsaker[arsak])
                                                .join(', ')}
                                        </FormSummary.Value>
                                    </FormSummary.Answer>
                                    {aktivitet.arbeidsrelatertArsak.annenArbeidsrelatertArsak && (
                                        <FormSummary.Answer>
                                            <FormSummary.Label>Andre arbeidsrelaterte årsaker</FormSummary.Label>
                                            <FormSummary.Value>
                                                {aktivitet.arbeidsrelatertArsak.annenArbeidsrelatertArsak}
                                            </FormSummary.Value>
                                        </FormSummary.Answer>
                                    )}
                                </>
                            )}
                        </>
                    )}
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
                <FormSummary.Value>{tilbakedateringGrunnToReadable(tilbakedatering.grunn)}</FormSummary.Value>
            </FormSummary.Answer>
            {tilbakedatering.annenGrunn && (
                <FormSummary.Answer>
                    <FormSummary.Label>Annen for tilbakedatering</FormSummary.Label>
                    <FormSummary.Value>{tilbakedatering.annenGrunn}</FormSummary.Value>
                </FormSummary.Answer>
            )}
        </>
    )
}

function tilbakedateringGrunnToReadable(grunn: TilbakedateringGrunn): string {
    switch (grunn) {
        case 'VENTETID_LEGETIME':
            return 'Ventetid på legetime'
        case 'MANGLENDE_SYKDOMSINNSIKT_GRUNNET_ALVORLIG_PSYKISK_SYKDOM':
            return 'Manglende sykdomsinnsikt grunnet alvorlig psykisk sykdom'
        case 'ANNET':
            return 'Annet'
    }
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
        <>
            <FormSummary.Answer>
                <FormSummary.Label>Hoveddiagnose</FormSummary.Label>
                <FormSummary.Value>
                    <BodyShort>
                        {diagnose.hoved.text} ({diagnose.hoved.code})
                    </BodyShort>
                    <Detail>{diagnose.hoved.system}</Detail>
                </FormSummary.Value>
            </FormSummary.Answer>
            <FormSummary.Answer>
                <FormSummary.Label>Bidiagnoser</FormSummary.Label>
                <FormSummary.Value>
                    {(diagnose.bi ?? []).filter(R.isNonNull).map((bidiagnose, index) => (
                        <div key={index}>
                            <BodyShort>
                                {bidiagnose.text} ({bidiagnose.code})
                            </BodyShort>
                            <Detail>{bidiagnose.system}</Detail>
                        </div>
                    ))}
                </FormSummary.Value>
            </FormSummary.Answer>
        </>
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
