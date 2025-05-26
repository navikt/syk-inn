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

import { NySykmeldingMultiStepState } from '../../providers/redux/reducers/ny-sykmelding-multistep'

type CreateDefaultValuesData = {
    initialValues: NySykmeldingMultiStepState
    initialSuggestions: NySykmeldingSuggestions
}

export function createDefaultValues({
    initialValues,
    initialSuggestions,
}: CreateDefaultValuesData): DefaultValues<NySykmeldingMainFormValues> {
    // TODO: Needs to sigourney weave in server data as well
    return {
        perioder: initialValues.aktiviteter?.map((it) => ({
            periode: {
                fom: it.fom,
                tom: it.tom,
            },
            aktivitet: {
                type: it.type,
                grad: it.grad,
            },
        })) ?? [getDefaultPeriode()],
        diagnoser: {
            hoved: toInitialDiagnose(initialValues.diagnose?.hoved ?? null, initialSuggestions.diagnose.value),
        },
        tilbakedatering: initialValues.tilbakedatering
            ? {
                  fom:
                      initialValues.tilbakedatering.fom && isValid(toDate(initialValues.tilbakedatering.fom))
                          ? initialValues.tilbakedatering.fom
                          : null,
                  grunn: initialValues.tilbakedatering?.grunn ?? null,
              }
            : null,
        meldinger: {
            tilNav: initialValues.meldinger?.tilNav ?? null,
            tilArbeidsgiver: initialValues.meldinger?.tilArbeidsgiver ?? null,
        },
        andreSporsmal: (
            [
                initialValues.andreSporsmal?.svangerskapsrelatert ? 'svangerskapsrelatert' : null,
                initialValues.andreSporsmal?.yrkesskade ? 'yrkesskade' : null,
            ] satisfies (AndreSporsmalValues | null)[]
        ).filter(R.isTruthy),
    }
}

/**
 * Presedence for hoveddiagnose:
 * 1. Existing diagnose in form
 * 2. Initial suggestions from server
 * 3. Null
 *
 * Diagnose component has the responsibility of displaying eventual server errors
 */
export function toInitialDiagnose(
    initialFormDiagnose: DiagnoseSuggestion | null,
    serverSuggestion: DiagnoseSuggestion | null,
): DiagnoseSuggestion | null {
    if (initialFormDiagnose != null) {
        return initialFormDiagnose
    }

    if (serverSuggestion != null) {
        return serverSuggestion
    }

    return null
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
