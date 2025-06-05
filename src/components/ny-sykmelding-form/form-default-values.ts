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

import { NySykmeldingMultiStepState } from '../../providers/redux/reducers/ny-sykmelding-multistep'

type CreateDefaultValuesData = {
    // TODO: better typing for drafts
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    draftValues: any
    initialValues: NySykmeldingMultiStepState
    initialSuggestions: NySykmeldingSuggestions
}

/**
 * Overall the default values have the following precedence:
 * 1. Draft values (if available)
 * 2. Initial values from the multistep state (user may return from a previous step)
 * 3. Initial suggestions from the server
 * 4. Inherent defaults
 */
export function createDefaultValues({
    draftValues,
    initialValues,
    initialSuggestions,
}: CreateDefaultValuesData): DefaultValues<NySykmeldingMainFormValues> {
    if (draftValues != null) {
        return draftValues
    }

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
            showTilNav: initialValues.meldinger?.showTilNav ?? false,
            showTilArbeidsgiver: initialValues.meldinger?.showTilArbeidsgiver ?? false,
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
