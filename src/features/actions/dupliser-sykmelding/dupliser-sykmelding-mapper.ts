import * as R from 'remeda'
import { logger } from '@navikt/next-logger'

import { SykmeldingFragment, SykmeldingRedactedFragment } from '@queries'
import { AktivitetsPeriode, NySykmeldingMainFormValues } from '@features/ny-sykmelding-form/form/types'
import {
    sykmeldingFragmentAktivitetToFormValue,
    sykmeldingFragmentToNySykmeldingFormValues,
} from '@features/actions/common/gql-sykmelding-mappers'

export function dupliserSykmeldingDefaultValues(sykmelding: SykmeldingFragment): NySykmeldingMainFormValues {
    if (sykmelding.__typename === 'SykmeldingRedacted') {
        return dupliserRedactedSykmelding(sykmelding)
    }

    return {
        ...sykmeldingFragmentToNySykmeldingFormValues(sykmelding),
        perioder: sykmelding.values.aktivitet
            .map((it) => sykmeldingFragmentAktivitetToFormValue({ fom: it.fom, tom: it.tom }, it))
            .filter(R.isNonNull),
        // Meldinger are specifically not part of the duplisering
        meldinger: {
            showTilNav: false,
            tilNav: null,
            showTilArbeidsgiver: false,
            tilArbeidsgiver: null,
        },
    }
}

function dupliserRedactedSykmelding(sykmelding: SykmeldingRedactedFragment): NySykmeldingMainFormValues {
    return {
        perioder: sykmelding.values.aktivitet.map(toDuplisertRedactedAktivitet).filter(R.isNonNull),
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
