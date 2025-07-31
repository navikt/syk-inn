import { Alert, BodyShort, Detail, FormSummary, Heading, Skeleton } from '@navikt/ds-react'
import React, { ReactElement } from 'react'
import * as R from 'remeda'
import { useQuery } from '@apollo/client'

import {
    NySykmeldingAktivitet,
    NySykmeldingDiagnoser,
    NySykmeldingTilbakedatering,
    ActivePatient,
} from '@core/redux/reducers/ny-sykmelding'
import { useAppSelector } from '@core/redux/hooks'
import { AkselNextLink } from '@components/links/AkselNextLink'
import { TilbakedateringGrunn } from '@data-layer/common/tilbakedatering'
import { toReadableDate, toReadableDatePeriod } from '@lib/date'
import { PasientDocument } from '@queries'

import { ArbeidsrelaterteArsaker } from '../aktivitet/ArsakerPicker'
import { useFormStep } from '../steps/useFormStep'

import { useFormValuesSummaryDraft } from './useFormValuesSummaryDraft'
import { aktivitetDescription } from './summary-text-utils'

type Props = {
    className?: string
}

function FormValuesSummary({ className }: Props): ReactElement {
    const [, setStep] = useFormStep()
    const { pasient, values } = useAppSelector((state) => state.nySykmelding)
    const { draftLoading } = useFormValuesSummaryDraft(values)
    const pasientQuery = useQuery(PasientDocument)

    if (draftLoading || pasientQuery.loading) {
        return (
            <div className={className}>
                <FormSummary>
                    <FormSummary.Header>
                        <FormSummary.Heading level="2">Oppsummering sykmelding</FormSummary.Heading>
                        <FormSummary.EditLink as="button" onClick={() => setStep('main')} />
                    </FormSummary.Header>
                    <FormSummary.Answers>
                        <FormSummaryAnswerSkeleton />
                        <FormSummaryAnswerSkeleton />
                        <FormSummaryAnswerSkeleton />
                        <FormSummaryAnswerSkeleton />
                        <FormSummaryAnswerSkeleton />
                        <FormSummaryAnswerSkeleton />
                    </FormSummary.Answers>
                </FormSummary>
            </div>
        )
    }

    if (!draftLoading && values == null) {
        return (
            <div className={className}>
                <FormSummary>
                    <FormSummary.Header>
                        <FormSummary.Heading level="2">Oppsummering sykmelding</FormSummary.Heading>
                    </FormSummary.Header>
                    <FormSummary.Answers>
                        <Alert variant="warning">
                            <Heading size="small" level="2" spacing>
                                Ingen pågående sykmelding
                            </Heading>
                            <BodyShort spacing>
                                Det ser ikke ut som dette er en pågående sykmelding. Dersom du har hatt nettleseren oppe
                                siden sist du jobbet, så kan utkastet ha blitt slettet.
                            </BodyShort>
                            <BodyShort>
                                Du kan begynne utfyllingen på nytt ved å gå tilbake til{' '}
                                <AkselNextLink href="/fhir">pasientens oversikt</AkselNextLink> og beginne på nytt.
                            </BodyShort>
                        </Alert>
                    </FormSummary.Answers>
                </FormSummary>
            </div>
        )
    }

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

                    {values?.meldinger?.tilNav && (
                        <FormSummary.Answer>
                            <FormSummary.Label>Til NAV</FormSummary.Label>
                            <FormSummary.Value>{values?.meldinger?.tilNav}</FormSummary.Value>
                        </FormSummary.Answer>
                    )}
                    {values?.meldinger?.tilArbeidsgiver && (
                        <FormSummary.Answer>
                            <FormSummary.Label>Til arbeidsgiver</FormSummary.Label>
                            <FormSummary.Value>{values?.meldinger?.tilArbeidsgiver}</FormSummary.Value>
                        </FormSummary.Answer>
                    )}

                    {values?.andreSporsmal?.svangerskapsrelatert && (
                        <FormSummary.Answer>
                            <FormSummary.Label>Annen info</FormSummary.Label>
                            <FormSummary.Value>Sykdommen er svangerskapsrelatert</FormSummary.Value>
                        </FormSummary.Answer>
                    )}
                    {values?.andreSporsmal?.yrkesskade && (
                        <FormSummary.Answer>
                            <FormSummary.Label>Yrkesskade</FormSummary.Label>
                            <FormSummary.Value>Ja</FormSummary.Value>
                        </FormSummary.Answer>
                    )}
                </FormSummary.Answers>
            </FormSummary>
        </div>
    )
}

function AktivitetSummaryAnswers({ aktiviteter }: { aktiviteter: NySykmeldingAktivitet[] | null }): ReactElement {
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

function TilbakedateringSummaryAnswers({
    tilbakedatering,
}: {
    tilbakedatering: NySykmeldingTilbakedatering
}): ReactElement {
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

function DiagnoseSummaryAnswers({ diagnose }: { diagnose: NySykmeldingDiagnoser | null }): ReactElement {
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
            {diagnose.bi != null && diagnose.bi.length !== 0 && (
                <FormSummary.Answer>
                    <FormSummary.Label>Bidiagnoser</FormSummary.Label>
                    <FormSummary.Value>
                        {diagnose.bi.filter(R.isNonNull).map((diagnose) => (
                            <div key={`${diagnose.system}-${diagnose.code}`}>
                                <BodyShort>
                                    {diagnose.text} ({diagnose.code})
                                </BodyShort>
                                <Detail>{diagnose.system}</Detail>
                            </div>
                        ))}
                    </FormSummary.Value>
                </FormSummary.Answer>
            )}
        </>
    )
}

function PatientSummaryAnswers({ pasient }: { pasient: ActivePatient | null }): ReactElement {
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

function FormSummaryAnswerSkeleton(): ReactElement {
    return (
        <FormSummary.Answer>
            <FormSummary.Label>
                <Skeleton width={150} />
            </FormSummary.Label>
            <FormSummary.Value>
                <Skeleton width={200} />
            </FormSummary.Value>
        </FormSummary.Answer>
    )
}

export default FormValuesSummary
