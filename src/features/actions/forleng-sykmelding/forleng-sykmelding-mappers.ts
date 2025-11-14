import * as R from 'remeda'
import { addDays } from 'date-fns'
import { logger } from '@navikt/next-logger'

import { AktivitetsPeriode, NySykmeldingMainFormValues } from '@features/ny-sykmelding-form/form/types'
import {
    SykmeldingFragment,
    SykmeldingFullFragment,
    SykmeldingLightFragment,
    SykmeldingRedactedFragment,
} from '@queries'
import {
    sykmeldingFragmentAktivitetToFormValue,
    fullSykmeldingFragmentToNySykmeldingFormValues,
    sykmeldingDiagnoserFragmentToSykmeldingFormValues,
} from '@features/actions/common/gql-sykmelding-mappers'
import { raise } from '@lib/ts'
import { dateOnly } from '@lib/date'
import { nySykmeldingDefaultValues } from '@features/actions/ny-sykmelding/ny-sykmelding-mappers'
import { NySykmeldingFormState } from '@core/redux/reducers/ny-sykmelding'
import {
    defaultAndreSporsmal,
    defaultArbeidsforhold,
    defaultMeldinger,
    defaultTilbakedatering,
    defaultUtdypendeSporsmal,
} from '@features/ny-sykmelding-form/form/default-values'

/**
 * Creates a set of default form values specifically for 'forlenging' a sykmelding. Does NOT take
 * into account any draft or server values.
 */
export function forlengSykmeldingDefaultValues(
    sykmelding: SykmeldingFragment,
    stateValues: NySykmeldingFormState | null,
): [values: NySykmeldingMainFormValues, nextFom: string] {
    const [forlengetSykmeldingFormValues, nextFom] =
        sykmelding.__typename === 'SykmeldingRedacted'
            ? forlengRedactedSykmelding(sykmelding)
            : sykmelding.__typename === 'SykmeldingLight'
              ? forlengLightSykmelding(sykmelding)
              : forlengFullSykmelding(sykmelding)

    /**
     * If we already have values in state, we are returning to the form after having filled out
     * a forlenged sykmelding, in this case we want to initialize the form with the state values.
     */
    if (stateValues != null) {
        return [nySykmeldingDefaultValues(stateValues, null), nextFom]
    }

    return [forlengetSykmeldingFormValues, nextFom]
}

function forlengFullSykmelding(
    sykmelding: SykmeldingFullFragment,
): [values: NySykmeldingMainFormValues, nextFom: string] {
    const [forlengetPeriode, nextFom] = toForlengelsesAktivitet(sykmelding.values.aktivitet)

    return [
        {
            ...fullSykmeldingFragmentToNySykmeldingFormValues(sykmelding),
            perioder: [forlengetPeriode],
            // Meldinger are specifically not part of the forlenging
            meldinger: {
                showTilNav: false,
                tilNav: null,
                showTilArbeidsgiver: false,
                tilArbeidsgiver: null,
            },
        },
        nextFom,
    ]
}

function forlengLightSykmelding(
    sykmelding: SykmeldingLightFragment,
): [values: NySykmeldingMainFormValues, nextFom: string] {
    const [forlengetPeriode, nextFom] = toForlengelsesAktivitet(sykmelding.values.aktivitet)

    return [
        {
            diagnoser: sykmeldingDiagnoserFragmentToSykmeldingFormValues(sykmelding.values),
            perioder: [forlengetPeriode],
            meldinger: defaultMeldinger(),
            andreSporsmal: defaultAndreSporsmal(),
            arbeidsforhold: defaultArbeidsforhold(),
            utdypendeSporsmal: defaultUtdypendeSporsmal(),
            tilbakedatering: defaultTilbakedatering(),
        },
        nextFom,
    ]
}

function toForlengelsesAktivitet(
    previousAktivitet: SykmeldingFullFragment['values']['aktivitet'],
): [forlenget: AktivitetsPeriode, nextFom: string] {
    const latestPeriode = R.firstBy(previousAktivitet, [(it) => it.fom, 'desc'])
    if (!latestPeriode) {
        raise('Sykmelding without aktivitetsperioder, this should not happen')
    }

    const nextFom = dateOnly(addDays(latestPeriode.tom, 1))

    return [
        sykmeldingFragmentAktivitetToFormValue(
            {
                fom: nextFom,
                tom: null,
            },
            latestPeriode,
        ),
        nextFom,
    ]
}

function forlengRedactedSykmelding(
    sykmelding: SykmeldingRedactedFragment,
): [values: NySykmeldingMainFormValues, nextFom: string] {
    const latestPeriode = R.firstBy(sykmelding.values.aktivitet, [(it) => it.fom, 'desc'])
    if (!latestPeriode) {
        raise('Sykmelding without aktivitetsperioder, this should not happen')
    }

    const nextFom = dateOnly(addDays(latestPeriode.tom, 1))

    let nextAkvititet: AktivitetsPeriode
    switch (latestPeriode.type) {
        case 'AKTIVITET_IKKE_MULIG':
            nextAkvititet = {
                periode: {
                    fom: nextFom,
                    tom: null,
                },
                aktivitet: {
                    type: 'AKTIVITET_IKKE_MULIG',
                    grad: null,
                },
                medisinskArsak: {
                    isMedisinskArsak: true,
                },
                arbeidsrelatertArsak: {
                    isArbeidsrelatertArsak: false,
                    arbeidsrelaterteArsaker: null,
                    annenArbeidsrelatertArsak: null,
                },
            }
            break
        case 'GRADERT':
            nextAkvititet = {
                periode: {
                    fom: nextFom,
                    tom: null,
                },
                aktivitet: {
                    type: 'GRADERT',
                    grad: null,
                },
                medisinskArsak: null,
                arbeidsrelatertArsak: null,
            }
            break
        case 'AVVENTENDE':
        case 'BEHANDLINGSDAGER':
        case 'REISETILSKUDD':
            logger.info(`Forlengelse with aktivitet of type ${latestPeriode.type} is not supported yet`)
            nextAkvititet = {
                // This should not happen unless the user forlengs sykmeldinger from a non-syk-inn source, but
                // this is in essence duplicated getDefaultPeriode from form-default-values.ts
                aktivitet: {
                    type: 'GRADERT',
                    grad: null,
                },
                periode: {
                    fom: dateOnly(new Date()),
                    tom: null,
                },
                arbeidsrelatertArsak: null,
                medisinskArsak: null,
            } satisfies AktivitetsPeriode
    }

    return [
        {
            // TODO: Re-use form default values per field
            perioder: [nextAkvititet],
            arbeidsforhold: {
                harFlereArbeidsforhold: 'NEI',
                sykmeldtFraArbeidsforhold: null,
                // Used only for feature-toggle: 'SYK_INN_AAREG'
                aaregArbeidsforhold: null,
            },
            tilbakedatering: null,
            diagnoser: {
                hoved: null,
                bidiagnoser: [],
            },
            meldinger: {
                showTilNav: false,
                tilNav: null,
                showTilArbeidsgiver: false,
                tilArbeidsgiver: null,
            },
            andreSporsmal: {
                svangerskapsrelatert: false,
                yrkesskade: {
                    yrkesskade: false,
                    skadedato: null,
                },
            },
            utdypendeSporsmal: null,
        },
        nextFom,
    ]
}
