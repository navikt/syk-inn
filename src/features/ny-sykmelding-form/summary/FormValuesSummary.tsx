import { BodyShort, Detail, FormSummary, List, Skeleton } from '@navikt/ds-react'
import React, { ReactElement } from 'react'
import * as R from 'remeda'
import { useQuery } from '@apollo/client/react'

import {
    NySykmeldingAktivitet,
    NySykmeldingDiagnoser,
    NySykmeldingTilbakedatering,
    NySykmeldingMeldinger,
    NySykmeldingAndreSporsmal,
    ActivePatient,
    NySykmeldingArbeidsforhold,
} from '@core/redux/reducers/ny-sykmelding'
import { useAppSelector } from '@core/redux/hooks'
import { AkselNextLink } from '@components/links/AkselNextLink'
import { TilbakedateringGrunn } from '@data-layer/common/tilbakedatering'
import { toReadableDate, toReadableDatePeriod, toReadablePeriodLength } from '@lib/date'
import { PasientDocument } from '@queries'
import { NySykmeldingAnnenFravarsgrunn, NySykmeldingUtdypendeSporsmal } from '@core/redux/reducers/ny-sykmelding/form'
import { useMode } from '@core/providers/Modes'
import { DetailedAlert, InlineWarning, SimpleAlert } from '@components/help/GeneralErrors'
import { annenFravarsgrunnToText } from '@data-layer/common/annen-fravarsgrunn'

import { ArbeidsrelaterteArsaker } from '../aktivitet/ArsakerPicker'
import { useFormStep } from '../steps/useFormStep'

import { useFormValuesSummaryDraft } from './useFormValuesSummaryDraft'
import { aktivitetDescription } from './summary-text-utils'

const sectionSummaryHeadingId = 'sykmelding-summary-heading'

type Props = {
    className?: string
}

function FormValuesSummary({ className }: Props): ReactElement {
    const mode = useMode()
    const [, setStep] = useFormStep()
    const { pasient, values } = useAppSelector((state) => state.nySykmelding)
    const { draftLoading } = useFormValuesSummaryDraft(values)
    const pasientQuery = useQuery(PasientDocument)

    if (draftLoading || pasientQuery.loading) {
        return (
            <section
                className={className}
                aria-labelledby={sectionSummaryHeadingId}
                aria-busy="true"
                aria-live="polite"
            >
                <FormSummary>
                    <FormSummary.Header>
                        <FormSummary.Heading id={sectionSummaryHeadingId} level="2">
                            Oppsummering sykmelding
                        </FormSummary.Heading>
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
            </section>
        )
    }

    if (values == null) {
        return (
            <section className={className} aria-labelledby={sectionSummaryHeadingId}>
                <FormSummary>
                    <FormSummary.Header>
                        <FormSummary.Heading id={sectionSummaryHeadingId} level="2">
                            Oppsummering sykmelding
                        </FormSummary.Heading>
                    </FormSummary.Header>
                    <FormSummary.Answers>
                        <DetailedAlert
                            level="warning"
                            className="rounded-none"
                            title="Ingen pågående sykmelding"
                            noCallToAction
                        >
                            <BodyShort spacing>
                                Det ser ikke ut som dette er en pågående sykmelding. Dersom du har hatt nettleseren oppe
                                siden sist du jobbet, så kan utkastet ha blitt slettet.
                            </BodyShort>
                            <BodyShort>
                                Du kan begynne utfyllingen på nytt ved å gå tilbake til{' '}
                                <AkselNextLink href={mode.paths.root}>pasientens oversikt</AkselNextLink> og begynne på
                                nytt.
                            </BodyShort>
                        </DetailedAlert>
                    </FormSummary.Answers>
                </FormSummary>
            </section>
        )
    }

    return (
        <section className={className} aria-labelledby={sectionSummaryHeadingId}>
            <FormSummary>
                <FormSummary.Header>
                    <FormSummary.Heading id={sectionSummaryHeadingId} level="2">
                        Oppsummering sykmelding
                    </FormSummary.Heading>
                </FormSummary.Header>
                <FormSummary.Answers>
                    <PatientSummaryAnswers pasient={pasient} />
                    <ArbeidsforholdSummaryAnswers arbeidsforhold={values.arbeidsforhold} />
                    <AktivitetSummaryAnswers aktiviteter={values.aktiviteter} />
                    <TilbakedateringSummaryAnswers tilbakedatering={values.tilbakedatering} />
                    <DiagnoseSummaryAnswers diagnose={values.diagnose} />
                    <AnnenFravarsgrunn annenFravarsgrunn={values.annenFravarsgrunn} />
                    <UtdypendeSporsmalSummaryAnswers utdypendeSporsmal={values.utdypendeSporsmal} />
                    <MeldingerSummaryAnswers meldinger={values.meldinger} />
                    <AnderSporsmalSummaryAnswers andreSporsmal={values.andreSporsmal} />
                </FormSummary.Answers>
                <FormSummary.Footer>
                    <FormSummary.EditLink as="button" onClick={() => setStep('main')} />
                </FormSummary.Footer>
            </FormSummary>
        </section>
    )
}

function AktivitetSummaryAnswers({ aktiviteter }: { aktiviteter: NySykmeldingAktivitet[] | null }): ReactElement {
    if (aktiviteter == null) {
        return (
            <FormSummary.Answer>
                <FormSummary.Label>Periode</FormSummary.Label>
                <FormSummary.Value>
                    <SimpleAlert level="warning" title="Denne delen av sykmeldingen er ikke utfylt.">
                        Gå tilbake og fyll ut for å sende inn.
                    </SimpleAlert>
                </FormSummary.Value>
            </FormSummary.Answer>
        )
    }

    if (aktiviteter.length === 1) {
        return <AktivitetSummaryAnswer aktivitet={aktiviteter[0]} index={null} />
    }

    return (
        <FormSummary.Answer>
            <FormSummary.Label>Perioder</FormSummary.Label>
            <FormSummary.Value>
                <FormSummary.Answers>
                    {aktiviteter.map((aktivitet, index) => (
                        <AktivitetSummaryAnswer aktivitet={aktivitet} index={index} key={index} />
                    ))}
                </FormSummary.Answers>
            </FormSummary.Value>
        </FormSummary.Answer>
    )
}

function AktivitetSummaryAnswer({
    aktivitet,
    index,
}: {
    aktivitet: NySykmeldingAktivitet
    index: number | null
}): ReactElement {
    return (
        <FormSummary.Answer>
            <FormSummary.Label>Periode{index != null ? ` ${index + 1}` : undefined}</FormSummary.Label>
            <FormSummary.Value>
                {aktivitet.tom != null ? (
                    <BodyShort>
                        {toReadableDatePeriod(aktivitet.fom, aktivitet.tom)}
                        <span className="font-bold"> · </span>
                        {toReadablePeriodLength(aktivitet.fom, aktivitet.tom)}
                    </BodyShort>
                ) : (
                    <InlineWarning title="Periode mangler datoer" size="small" />
                )}
                <BodyShort>{aktivitetDescription(aktivitet)}</BodyShort>
                {aktivitet.type === 'AKTIVITET_IKKE_MULIG' && (
                    <>
                        {[
                            aktivitet.medisinskArsak.isMedisinskArsak,
                            aktivitet.arbeidsrelatertArsak.isArbeidsrelatertArsak,
                        ].some(R.isTruthy) && (
                            <List>
                                {aktivitet.medisinskArsak.isMedisinskArsak && (
                                    <List.Item>Medisinske årsaker forhindrer arbeidsaktivitet</List.Item>
                                )}
                                {aktivitet.arbeidsrelatertArsak.isArbeidsrelatertArsak && (
                                    <List.Item>
                                        <BodyShort>Arbeidsrelaterte årsaker forhindrer arbeidsaktivitet</BodyShort>
                                        <List size="small">
                                            {aktivitet.arbeidsrelatertArsak.arbeidsrelaterteArsaker?.map((arsak) => {
                                                if (arsak === 'ANNET') {
                                                    return (
                                                        <List.Item key={arsak}>
                                                            <BodyShort>{ArbeidsrelaterteArsaker[arsak]}</BodyShort>
                                                            <BodyShort size="small" className="italic">
                                                                {
                                                                    aktivitet.arbeidsrelatertArsak
                                                                        .annenArbeidsrelatertArsak
                                                                }
                                                            </BodyShort>
                                                        </List.Item>
                                                    )
                                                }

                                                return (
                                                    <List.Item key={arsak}>
                                                        <BodyShort>{ArbeidsrelaterteArsaker[arsak]}</BodyShort>
                                                    </List.Item>
                                                )
                                            })}
                                        </List>
                                    </List.Item>
                                )}
                            </List>
                        )}
                    </>
                )}
            </FormSummary.Value>
        </FormSummary.Answer>
    )
}

function TilbakedateringSummaryAnswers({
    tilbakedatering,
}: {
    tilbakedatering: NySykmeldingTilbakedatering | null
}): ReactElement | null {
    if (tilbakedatering == null) {
        return null
    }
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
                    <FormSummary.Label>Annen grunn for tilbakedatering</FormSummary.Label>
                    <FormSummary.Value>{tilbakedatering.annenGrunn}</FormSummary.Value>
                </FormSummary.Answer>
            )}
        </>
    )
}

function DiagnoseSummaryAnswers({ diagnose }: { diagnose: NySykmeldingDiagnoser | null }): ReactElement {
    if (diagnose == null) {
        return (
            <FormSummary.Answer>
                <FormSummary.Label>Hoveddiagnose</FormSummary.Label>
                <FormSummary.Value>
                    <SimpleAlert level="warning" title="Denne delen av sykmeldingen er ikke utfylt." noCallToAction>
                        Gå tilbake og fyll ut for å sende inn.
                    </SimpleAlert>
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

function UtdypendeSporsmalSummaryAnswers({
    utdypendeSporsmal,
}: {
    utdypendeSporsmal: NySykmeldingUtdypendeSporsmal | null
}): ReactElement | null {
    return (
        <>
            {utdypendeSporsmal?.utfordringerMedArbeid && (
                <FormSummary.Answer>
                    <FormSummary.Label>
                        Hvilke utfordringer har pasienten med å utføre gradert arbeid?
                    </FormSummary.Label>
                    <FormSummary.Value>{utdypendeSporsmal.utfordringerMedArbeid}</FormSummary.Value>
                </FormSummary.Answer>
            )}
            {utdypendeSporsmal?.medisinskOppsummering && (
                <FormSummary.Answer>
                    <FormSummary.Label>
                        Gi en kort medisinsk oppsummering av tilstanden (sykehistorie, hovedsymptomer, pågående/planlagt
                        behandling)
                    </FormSummary.Label>
                    <FormSummary.Value>{utdypendeSporsmal.medisinskOppsummering}</FormSummary.Value>
                </FormSummary.Answer>
            )}
            {utdypendeSporsmal?.hensynPaArbeidsplassen && (
                <FormSummary.Answer>
                    <FormSummary.Label>
                        Hvilke hensyn må være på plass for at pasienten kan prøves i det nåværende arbeidet?
                    </FormSummary.Label>
                    <FormSummary.Value>{utdypendeSporsmal.hensynPaArbeidsplassen}</FormSummary.Value>
                </FormSummary.Answer>
            )}
        </>
    )
}

function MeldingerSummaryAnswers({ meldinger }: { meldinger: NySykmeldingMeldinger | null }): ReactElement | null {
    if (meldinger == null) {
        return null
    }
    return (
        <>
            {meldinger?.showTilNav && (
                <FormSummary.Answer>
                    <FormSummary.Label>Til NAV</FormSummary.Label>
                    <FormSummary.Value>{meldinger?.tilNav}</FormSummary.Value>
                </FormSummary.Answer>
            )}
            {meldinger?.showTilArbeidsgiver && (
                <FormSummary.Answer>
                    <FormSummary.Label>Til arbeidsgiver</FormSummary.Label>
                    <FormSummary.Value>{meldinger?.tilArbeidsgiver}</FormSummary.Value>
                </FormSummary.Answer>
            )}
        </>
    )
}

function AnderSporsmalSummaryAnswers({
    andreSporsmal,
}: {
    andreSporsmal: NySykmeldingAndreSporsmal | null
}): ReactElement | null {
    if (andreSporsmal == null) {
        return null
    }

    return (
        <>
            {andreSporsmal?.svangerskapsrelatert && (
                <FormSummary.Answer>
                    <FormSummary.Label>Annen info</FormSummary.Label>
                    <FormSummary.Value>Sykdommen er svangerskapsrelatert</FormSummary.Value>
                </FormSummary.Answer>
            )}
            {andreSporsmal?.yrkesskade && (
                <FormSummary.Answer>
                    <FormSummary.Label>Kan skyldes yrkesskade</FormSummary.Label>
                    <FormSummary.Value>Ja</FormSummary.Value>
                </FormSummary.Answer>
            )}
            {andreSporsmal?.yrkesskadeDato && (
                <FormSummary.Answer>
                    <FormSummary.Label>Dato for yrkesskade</FormSummary.Label>
                    <FormSummary.Value>{toReadableDate(andreSporsmal.yrkesskadeDato)}</FormSummary.Value>
                </FormSummary.Answer>
            )}
        </>
    )
}

function AnnenFravarsgrunn({
    annenFravarsgrunn,
}: {
    annenFravarsgrunn: NySykmeldingAnnenFravarsgrunn | null
}): ReactElement | null {
    if (annenFravarsgrunn == null || !annenFravarsgrunn.harFravarsgrunn) {
        return null
    }

    return (
        <>
            <FormSummary.Answer>
                <FormSummary.Label>Annen lovfestet fraværsgrunn</FormSummary.Label>
                <FormSummary.Value>
                    {annenFravarsgrunn.fravarsgrunn
                        ? annenFravarsgrunnToText(annenFravarsgrunn.fravarsgrunn)
                        : 'Mangler'}
                </FormSummary.Value>
            </FormSummary.Answer>
        </>
    )
}

function PatientSummaryAnswers({ pasient }: { pasient: ActivePatient | null }): ReactElement {
    if (pasient == null) {
        return (
            <FormSummary.Answer>
                <FormSummary.Label>Sykmeldingen gjelder</FormSummary.Label>
                <FormSummary.Value>
                    <DetailedAlert level="warning" title="Ingen pasient er valgt" noCallToAction>
                        <BodyShort spacing>Det har skjedd en feil under oppstart av sykmeldingsskjemaet.</BodyShort>
                        <BodyShort>
                            Prøv å start skjemaet på nytt, eller kontakt support dersom feilen vedvarer.
                        </BodyShort>
                    </DetailedAlert>
                </FormSummary.Value>
            </FormSummary.Answer>
        )
    }

    return (
        <>
            <FormSummary.Answer>
                <FormSummary.Label>Sykmeldingen gjelder</FormSummary.Label>
                <FormSummary.Value>{pasient.navn}</FormSummary.Value>
                <FormSummary.Value>{pasient.ident}</FormSummary.Value>
            </FormSummary.Answer>
        </>
    )
}

function ArbeidsforholdSummaryAnswers({
    arbeidsforhold,
}: {
    arbeidsforhold: NySykmeldingArbeidsforhold | null
}): ReactElement {
    return (
        <>
            <FormSummary.Answer>
                <FormSummary.Label>Har pasienten flere arbeidsforhold?</FormSummary.Label>
                <FormSummary.Value>{arbeidsforhold?.harFlereArbeidsforhold ? 'Ja' : 'Nei'}</FormSummary.Value>
            </FormSummary.Answer>
            {arbeidsforhold?.harFlereArbeidsforhold && (
                <FormSummary.Answer>
                    <FormSummary.Label>Hvilket arbeidsforhold skal pasienten sykmeldes fra?</FormSummary.Label>
                    <FormSummary.Value>{arbeidsforhold?.sykmeldtFraArbeidsforhold}</FormSummary.Value>
                </FormSummary.Answer>
            )}
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

export default FormValuesSummary
