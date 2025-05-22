import { DefaultValues } from 'react-hook-form'
import { isValid, toDate } from 'date-fns'
import * as R from 'remeda'

import { AktivitetsPeriode, AndreSporsmalValues, NySykmeldingMainFormValues } from '@components/ny-sykmelding-form/form'

import { NySykmeldingMultiStepState } from '../../providers/redux/reducers/ny-sykmelding-multistep'

export function createDefaultValues(
    initialValues: NySykmeldingMultiStepState,
): DefaultValues<NySykmeldingMainFormValues> {
    // TODO: Needs to weave in server data as well
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
            hoved: initialValues.diagnose?.hoved ?? null,
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
