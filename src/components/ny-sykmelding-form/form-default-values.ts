import { DefaultValues } from 'react-hook-form'
import { isValid, toDate } from 'date-fns'
import * as R from 'remeda'

import {
    AktivitetsPeriode,
    NySykmeldingMainFormValues,
    NySykmeldingSuggestions,
} from '@components/ny-sykmelding-form/form'
import { DiagnoseSuggestion } from '@components/form/diagnose-combobox/DiagnoseCombobox'
import { DiagnoseFragment } from '@queries'
import { dateOnly } from '@utils/date'

import {
    AktivitetStep,
    AndreSporsmalStep,
    ArbeidsforholdStep,
    MeldingerStep,
    NySykmeldingMultiStepState,
    TilbakedateringStep,
} from '../../providers/redux/reducers/ny-sykmelding-multistep'
import { DraftValues } from '../../data-layer/draft/draft-schema'

type CreateDefaultValuesData = {
    draftValues: DraftValues | null
    valuesInState: NySykmeldingMultiStepState
    serverSuggestions: NySykmeldingSuggestions
}

/**
 * Overall the default values have the following precedence:
 * 1. Initial values from the multistep state (user may return from a previous step)
 * 2. Draft values (if available)
 * 3. Initial suggestions from the server
 * 4. Inherent defaults
 */
export function createDefaultFormValues({
    valuesInState,
    draftValues,
    serverSuggestions,
}: CreateDefaultValuesData): DefaultValues<NySykmeldingMainFormValues> {
    return {
        arbeidsforhold: toInitialArbeidsforhold(valuesInState.arbeidsforhold, draftValues?.arbeidsforhold ?? null),
        perioder: toInitialPerioder(draftValues?.perioder ?? null, valuesInState.aktiviteter),
        diagnoser: {
            hoved: toInitialDiagnose(
                valuesInState.diagnose?.hoved ?? null,
                draftValues?.hoveddiagnose ?? null,
                serverSuggestions.diagnose.value,
            ),
        },
        tilbakedatering: toInitialTilbakedatering(valuesInState.tilbakedatering, draftValues?.tilbakedatering ?? null),
        meldinger: toInitialMeldinger(valuesInState.meldinger, draftValues?.meldinger ?? null),
        andreSporsmal: toAndreSporsmal(valuesInState.andreSporsmal, draftValues),
    }
}

function toInitialArbeidsforhold(
    valuesInState: ArbeidsforholdStep | null,
    draftValues: DraftValues['arbeidsforhold'] | null,
): NySykmeldingMainFormValues['arbeidsforhold'] {
    if (valuesInState != null) {
        return {
            harFlereArbeidsforhold: booleanOrNullToJaEllerNei(valuesInState.harFlereArbeidsforhold),
            sykmeldtFraArbeidsforhold: valuesInState.sykmeldtFraArbeidsforhold ?? null,
        }
    }

    if (draftValues != null) {
        return {
            harFlereArbeidsforhold: draftValues.harFlereArbeidsforhold ?? null,
            sykmeldtFraArbeidsforhold: draftValues.sykmeldtFraArbeidsforhold ?? null,
        }
    }

    return {
        harFlereArbeidsforhold: 'NEI',
        sykmeldtFraArbeidsforhold: null,
    }
}

function toAndreSporsmal(
    valuesInState: AndreSporsmalStep | null,
    draftValues: DraftValues | null,
): NySykmeldingMainFormValues['andreSporsmal'] {
    if (valuesInState != null) {
        return {
            svangerskapsrelatert: valuesInState.svangerskapsrelatert,
            yrkesskade: {
                yrkesskade: valuesInState.yrkesskade,
                skadedato: valuesInState.yrkesskadeDato,
            },
        }
    }

    if (draftValues) {
        return {
            svangerskapsrelatert: draftValues.svangerskapsrelatert ?? false,
            yrkesskade: {
                yrkesskade: draftValues.yrkesskade?.yrkesskade ?? false,
                skadedato: draftValues.yrkesskade?.skadedato ?? null,
            },
        }
    }

    return {
        svangerskapsrelatert: false,
        yrkesskade: {
            yrkesskade: false,
            skadedato: null,
        },
    }
}

function toInitialTilbakedatering(
    valuesInState: TilbakedateringStep | null,
    draftValues: DraftValues['tilbakedatering'] | null,
): NySykmeldingMainFormValues['tilbakedatering'] | null {
    if (valuesInState) {
        return {
            fom: valuesInState.fom && isValid(toDate(valuesInState.fom)) ? valuesInState.fom : null,
            grunn: valuesInState?.grunn ?? null,
        }
    }

    if (draftValues) {
        return {
            fom: draftValues.fom && isValid(toDate(draftValues.fom)) ? draftValues.fom : null,
            grunn: draftValues.grunn ?? null,
        }
    }

    return null
}

/**
 * Presedence for hoveddiagnose:
 * 1. Existing diagnose in form (redux)
 * 2. Initial suggestions from server
 * 3. Null
 *
 * Diagnose component has the responsibility of displaying eventual server errors
 */
export function toInitialDiagnose(
    valuesInState: DiagnoseSuggestion | null,
    draftValues: DraftValues['hoveddiagnose'] | null,
    serverSuggestion: DiagnoseFragment | null,
): DiagnoseSuggestion | null {
    if (valuesInState != null) {
        return valuesInState
    }

    if (draftValues != null) {
        return {
            system: draftValues.system,
            code: draftValues.code,
            text: draftValues.text,
        }
    }

    if (serverSuggestion != null) {
        return R.omit(serverSuggestion, ['__typename'])
    }

    return null
}

/**
 * Presedence for initial periode:
 * 1. Existing perioder in form (redux)
 * 2. Draft values (if available)
 * 3. Form default
 */
export function toInitialPerioder(
    draftPerioder: DraftValues['perioder'] | null,
    initialState: AktivitetStep[] | null,
): NySykmeldingMainFormValues['perioder'] {
    if (initialState != null) {
        return initialState.map((it) => ({
            periode: {
                fom: it.fom,
                tom: it.tom,
            },
            aktivitet: {
                type: it.type,
                grad: it.type === 'GRADERT' ? it.grad.toFixed(0) : null,
            },
        }))
    }

    if (draftPerioder != null) {
        return draftPerioder.map((it) => ({
            periode: {
                fom: it.fom ?? '',
                tom: it.tom ?? '',
            },
            aktivitet: {
                type: it.type,
                grad: it.grad ?? null,
            },
        }))
    }

    return [getDefaultPeriode()]
}

function toInitialMeldinger(
    meldingerInState: MeldingerStep | null,
    draftMeldinger: DraftValues['meldinger'] | null,
): NySykmeldingMainFormValues['meldinger'] {
    if (meldingerInState != null) {
        return {
            showTilNav: meldingerInState.showTilNav ?? false,
            showTilArbeidsgiver: meldingerInState.showTilArbeidsgiver ?? false,
            tilNav: meldingerInState.tilNav ?? null,
            tilArbeidsgiver: meldingerInState.tilArbeidsgiver ?? null,
        }
    }

    if (draftMeldinger != null) {
        return {
            showTilNav: draftMeldinger.showTilNav ?? false,
            showTilArbeidsgiver: draftMeldinger.showTilArbeidsgiver ?? false,
            tilNav: draftMeldinger.tilNav ?? null,
            tilArbeidsgiver: draftMeldinger.tilArbeidsgiver ?? null,
        }
    }

    return {
        showTilNav: false,
        tilNav: null,
        showTilArbeidsgiver: false,
        tilArbeidsgiver: null,
    }
}

export function getDefaultPeriode(): AktivitetsPeriode {
    return {
        periode: {
            fom: dateOnly(new Date()),
            tom: '',
        },
        aktivitet: {
            type: 'GRADERT',
            grad: null,
        },
    }
}

function booleanOrNullToJaEllerNei(value: boolean | null): 'JA' | 'NEI' | null {
    if (value === null) return null
    return value ? 'JA' : 'NEI'
}
