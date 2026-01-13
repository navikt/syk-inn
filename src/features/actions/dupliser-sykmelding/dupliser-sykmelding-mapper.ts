import * as R from 'remeda'
import { logger } from '@navikt/next-logger'

import {
    SykmeldingFragment,
    SykmeldingFullFragment,
    SykmeldingLightFragment,
    SykmeldingRedactedFragment,
} from '@queries'
import { AktivitetsPeriode, NySykmeldingMainFormValues } from '@features/ny-sykmelding-form/form/types'
import {
    sykmeldingFragmentAktivitetToFormValue,
    fullSykmeldingFragmentToNySykmeldingFormValues,
    sykmeldingDiagnoserFragmentToSykmeldingFormValues,
} from '@features/actions/common/gql-sykmelding-mappers'
import { NySykmeldingFormState } from '@core/redux/reducers/ny-sykmelding'
import { nySykmeldingDefaultValues } from '@features/actions/ny-sykmelding/ny-sykmelding-mappers'
import {
    defaultAndreSporsmal,
    defaultAnnenfravarsgrunn,
    defaultArbeidsforhold,
    defaultMeldinger,
    defaultTilbakedatering,
    defaultUtdypendeSporsmal,
} from '@features/ny-sykmelding-form/form/default-values'

export function dupliserSykmeldingDefaultValues(
    sykmelding: SykmeldingFragment,
    stateValues: NySykmeldingFormState | null,
): NySykmeldingMainFormValues {
    /**
     * If we already have values in state, we are returning to the form after having filled out
     * a duplisert sykmelding, in this case we want to initialize the form with the state values.
     */
    if (stateValues != null) {
        return nySykmeldingDefaultValues(stateValues, null)
    }

    return sykmelding.__typename === 'SykmeldingRedacted'
        ? dupliserRedactedSykmelding(sykmelding)
        : sykmelding.__typename === 'SykmeldingLight'
          ? dupliserLightSykmelding(sykmelding)
          : dupliserFullSykmelding(sykmelding)
}

function dupliserFullSykmelding(sykmelding: SykmeldingFullFragment): NySykmeldingMainFormValues {
    return {
        ...fullSykmeldingFragmentToNySykmeldingFormValues(sykmelding),
        perioder: sykmelding.values.aktivitet
            .map((it) => sykmeldingFragmentAktivitetToFormValue({ fom: it.fom, tom: it.tom }, it))
            .filter(R.isNonNull),
        // Meldinger are specifically not part of the duplisering
        meldinger: defaultMeldinger(),
    }
}

function dupliserLightSykmelding(sykmelding: SykmeldingLightFragment): NySykmeldingMainFormValues {
    return {
        diagnoser: sykmeldingDiagnoserFragmentToSykmeldingFormValues(sykmelding.values),
        perioder: sykmelding.values.aktivitet
            .map((it) => sykmeldingFragmentAktivitetToFormValue({ fom: it.fom, tom: it.tom }, it))
            .filter(R.isNonNull),
        meldinger: defaultMeldinger(),
        andreSporsmal: defaultAndreSporsmal(),
        arbeidsforhold: defaultArbeidsforhold(),
        utdypendeSporsmal: defaultUtdypendeSporsmal(),
        annenFravarsgrunn: defaultAnnenfravarsgrunn(),
        tilbakedatering: defaultTilbakedatering(),
    }
}

function dupliserRedactedSykmelding(sykmelding: SykmeldingRedactedFragment): NySykmeldingMainFormValues {
    return {
        perioder: sykmelding.values.aktivitet.map(toDuplisertRedactedAktivitet).filter(R.isNonNull),
        diagnoser: {
            hoved: null,
            bidiagnoser: [],
        },
        arbeidsforhold: defaultArbeidsforhold(),
        tilbakedatering: defaultTilbakedatering(),
        meldinger: defaultMeldinger(),
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
                },
                medisinskArsak: {
                    // Default value used in form
                    isMedisinskArsak: true,
                },
                arbeidsrelatertArsak: {
                    isArbeidsrelatertArsak: false,
                    arbeidsrelaterteArsaker: null,
                    annenArbeidsrelatertArsak: null,
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
                },
                medisinskArsak: null,
                arbeidsrelatertArsak: null,
            }
        case 'AVVENTENDE':
        case 'BEHANDLINGSDAGER':
        case 'REISETILSKUDD':
            logger.info(`Duplisering with aktivitet of type ${aktivitet.type} is not supported yet`)
            return null
    }
}
