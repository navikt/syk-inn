import { logger } from '@navikt/next-logger'
import * as R from 'remeda'

import { NySykmeldingFormState } from '#core/redux/reducers/ny-sykmelding'
import {
    defaultAndreSporsmal,
    defaultAnnenfravarsgrunn,
    defaultArbeidsforhold,
    defaultMeldinger,
    defaultTilbakedatering,
    defaultUtdypendeSporsmal,
} from '#features/ny-sykmelding-form/form/default-values'
import { AktivitetsPeriode, NySykmeldingMainFormValues } from '#features/ny-sykmelding-form/form/types'
import { NySykmeldingFormVariantType } from '#features/ny-sykmelding-form/useFormVariant'
import {
    SykmeldingFragment,
    SykmeldingFullFragment,
    SykmeldingLightFragment,
    SykmeldingRedactedFragment,
} from '#queries'

import {
    sykmeldingFragmentAktivitetToFormValue,
    fullSykmeldingFragmentToNySykmeldingFormValues,
    sykmeldingDiagnoserFragmentToSykmeldingFormValues,
} from '../common/gql-sykmelding-mappers'
import { nySykmeldingDefaultValues } from '../ny-sykmelding/ny-sykmelding-mappers'

export function dupliserSykmeldingDefaultValues(
    sykmelding: SykmeldingFragment,
    stateValues: NySykmeldingFormState | null,
    variant: NySykmeldingFormVariantType,
): NySykmeldingMainFormValues {
    /**
     * If we already have values in state, we are returning to the form after having filled out
     * a duplisert sykmelding, in this case we want to initialize the form with the state values.
     */
    if (stateValues != null) {
        return nySykmeldingDefaultValues(stateValues, null, variant)
    }

    return sykmelding.__typename === 'SykmeldingRedacted'
        ? dupliserRedactedSykmelding(sykmelding, variant)
        : sykmelding.__typename === 'SykmeldingLight'
          ? dupliserLightSykmelding(sykmelding, variant)
          : dupliserFullSykmelding(sykmelding, variant)
}

function dupliserFullSykmelding(
    sykmelding: SykmeldingFullFragment,
    variant: NySykmeldingFormVariantType,
): NySykmeldingMainFormValues {
    return {
        ...fullSykmeldingFragmentToNySykmeldingFormValues(sykmelding),
        perioder: sykmelding.values.aktivitet
            .map((it) => sykmeldingFragmentAktivitetToFormValue({ fom: it.fom, tom: it.tom }, it))
            .filter(R.isNonNull),
        // Meldinger are specifically not part of the duplisering
        meldinger: defaultMeldinger(variant),
    }
}

function dupliserLightSykmelding(
    sykmelding: SykmeldingLightFragment,
    variant: NySykmeldingFormVariantType,
): NySykmeldingMainFormValues {
    return {
        diagnoser: sykmeldingDiagnoserFragmentToSykmeldingFormValues(sykmelding.values),
        perioder: sykmelding.values.aktivitet
            .map((it) => sykmeldingFragmentAktivitetToFormValue({ fom: it.fom, tom: it.tom }, it))
            .filter(R.isNonNull),
        meldinger: defaultMeldinger(variant),
        andreSporsmal: defaultAndreSporsmal(),
        arbeidsforhold: defaultArbeidsforhold(),
        utdypendeSporsmal: defaultUtdypendeSporsmal(),
        annenFravarsgrunn: defaultAnnenfravarsgrunn(),
        tilbakedatering: defaultTilbakedatering(),
    }
}

function dupliserRedactedSykmelding(
    sykmelding: SykmeldingRedactedFragment,
    variant: NySykmeldingFormVariantType,
): NySykmeldingMainFormValues {
    return {
        perioder: sykmelding.values.aktivitet.map(toDuplisertRedactedAktivitet).filter(R.isNonNull),
        diagnoser: {
            hoved: null,
            bidiagnoser: [],
        },
        arbeidsforhold: defaultArbeidsforhold(),
        tilbakedatering: defaultTilbakedatering(),
        meldinger: defaultMeldinger(variant),
        andreSporsmal: defaultAndreSporsmal(),
        annenFravarsgrunn: defaultAnnenfravarsgrunn(),
        utdypendeSporsmal: defaultUtdypendeSporsmal(),
    }
}

function toDuplisertRedactedAktivitet(
    aktivitet: SykmeldingRedactedFragment['values']['aktivitet'][0],
): AktivitetsPeriode | null {
    switch (aktivitet.type) {
        case 'AKTIVITET_IKKE_MULIG':
            return {
                periode: {
                    fom: aktivitet.fom,
                    tom: aktivitet.tom,
                },
                aktivitet: {
                    type: 'AKTIVITET_IKKE_MULIG',
                    grad: null,
                    arbeidsrelatertArsak: {
                        isArbeidsrelatertArsak: false,
                        arbeidsrelaterteArsaker: null,
                        annenArbeidsrelatertArsak: null,
                    },
                },
            }
        case 'GRADERT':
            return {
                periode: {
                    fom: aktivitet.fom,
                    tom: aktivitet.tom,
                },
                aktivitet: {
                    type: 'GRADERT',
                    grad: null,
                    arbeidsrelatertArsak: {
                        isArbeidsrelatertArsak: false,
                        arbeidsrelaterteArsaker: null,
                        annenArbeidsrelatertArsak: null,
                    },
                },
            }
        case 'AVVENTENDE':
        case 'BEHANDLINGSDAGER':
        case 'REISETILSKUDD':
            logger.info(`Duplisering with aktivitet of type ${aktivitet.type} is not supported yet`)
            return null
    }
}
