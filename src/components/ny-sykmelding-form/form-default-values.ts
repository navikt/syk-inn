import { DefaultValues } from 'react-hook-form'
import { isValid, toDate } from 'date-fns'
import * as R from 'remeda'

import {
    AktivitetsPeriode,
    AndreSporsmalValues,
    NySykmeldingMainFormValues,
    NySykmeldingSuggestions,
} from '@components/ny-sykmelding-form/form'
import { DiagnoseSuggestion } from '@components/form/diagnose-combobox/DiagnoseCombobox'
import { DiagnoseFragment } from '@queries'

import { AktivitetStep, NySykmeldingMultiStepState } from '../../providers/redux/reducers/ny-sykmelding-multistep'
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
export function createDefaultValues({
    draftValues,
    valuesInState,
    serverSuggestions,
}: CreateDefaultValuesData): DefaultValues<NySykmeldingMainFormValues> {
    return {
        perioder: toInitialPerioder(draftValues?.perioder ?? null, valuesInState.aktiviteter),
        diagnoser: {
            hoved: toInitialDiagnose(valuesInState.diagnose?.hoved ?? null, serverSuggestions.diagnose.value),
        },
        tilbakedatering: valuesInState.tilbakedatering
            ? {
                  fom:
                      valuesInState.tilbakedatering.fom && isValid(toDate(valuesInState.tilbakedatering.fom))
                          ? valuesInState.tilbakedatering.fom
                          : null,
                  grunn: valuesInState.tilbakedatering?.grunn ?? null,
              }
            : null,
        meldinger: {
            showTilNav: valuesInState.meldinger?.showTilNav ?? false,
            showTilArbeidsgiver: valuesInState.meldinger?.showTilArbeidsgiver ?? false,
            tilNav: valuesInState.meldinger?.tilNav ?? null,
            tilArbeidsgiver: valuesInState.meldinger?.tilArbeidsgiver ?? null,
        },
        andreSporsmal: (
            [
                valuesInState.andreSporsmal?.svangerskapsrelatert ? 'svangerskapsrelatert' : null,
                valuesInState.andreSporsmal?.yrkesskade ? 'yrkesskade' : null,
            ] satisfies (AndreSporsmalValues | null)[]
        ).filter(R.isTruthy),
    }
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
    initialFormDiagnose: DiagnoseSuggestion | null,
    serverSuggestion: DiagnoseFragment | null,
): DiagnoseSuggestion | null {
    if (initialFormDiagnose != null) {
        return initialFormDiagnose
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
                grad: it.grad,
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

export function getDefaultPeriode(): AktivitetsPeriode {
    return {
        periode: {
            fom: '',
            tom: '',
        },
        aktivitet: {
            type: 'AKTIVITET_IKKE_MULIG',
            grad: null,
        },
    }
}
