import * as R from 'remeda'
import { logger } from '@navikt/next-logger'

import { SykmeldingFragment, SykmeldingFullFragment, SykmeldingLightFragment } from '@queries'
import { NySykmeldingAktivitet, NySykmeldingFormState } from '@core/redux/reducers/ny-sykmelding'
import { sykmeldingFragmentToMainStepStateNoAktivitet } from '@data-layer/common/sykmelding-fragment-to-multistep-state'

export function dupliserSykmelding(sykmelding: SykmeldingFragment): NySykmeldingFormState {
    if (sykmelding.__typename === 'SykmeldingLight') {
        return dupliserLightSykmelding(sykmelding)
    }

    return {
        ...sykmeldingFragmentToMainStepStateNoAktivitet(sykmelding),
        aktiviteter: sykmelding.values.aktivitet.map(toDuplisertFullAktivitet).filter(R.isNonNull),
    }
}

function toDuplisertFullAktivitet(
    aktivitet: SykmeldingFullFragment['values']['aktivitet'][0],
): NySykmeldingAktivitet | null {
    switch (aktivitet.__typename) {
        case 'AktivitetIkkeMulig':
            return {
                type: 'AKTIVITET_IKKE_MULIG',
                fom: aktivitet.fom,
                tom: aktivitet.tom,
                medisinskArsak: {
                    isMedisinskArsak: aktivitet.medisinskArsak?.isMedisinskArsak ?? false,
                },
                arbeidsrelatertArsak: {
                    isArbeidsrelatertArsak: aktivitet.arbeidsrelatertArsak?.isArbeidsrelatertArsak ?? false,
                    arbeidsrelaterteArsaker: aktivitet.arbeidsrelatertArsak?.arbeidsrelaterteArsaker ?? [],
                    annenArbeidsrelatertArsak: aktivitet.arbeidsrelatertArsak?.annenArbeidsrelatertArsak ?? null,
                },
            } satisfies NySykmeldingAktivitet

        case 'Gradert':
            return {
                type: 'GRADERT',
                fom: aktivitet.fom,
                tom: aktivitet.tom,
                grad: aktivitet.grad,
            } satisfies NySykmeldingAktivitet

        case 'Reisetilskudd':
        case 'Avventende':
        case 'Behandlingsdager':
            logger.info(`Duplisering with aktivitet of type ${aktivitet.type} is not supported yet`)
            return null
    }
}

function dupliserLightSykmelding(sykmelding: SykmeldingLightFragment): NySykmeldingFormState {
    return {
        aktiviteter: sykmelding.values.aktivitet.map(toDuplisertLightAktivitet).filter(R.isNonNull),
        arbeidsforhold: null,
        tilbakedatering: null,
        diagnose: null,
        meldinger: null,
        andreSporsmal: null,
    }
}

function toDuplisertLightAktivitet(
    aktivitet: SykmeldingLightFragment['values']['aktivitet'][0],
): NySykmeldingAktivitet | null {
    switch (aktivitet.type) {
        case 'AKTIVITET_IKKE_MULIG':
            return {
                type: 'AKTIVITET_IKKE_MULIG',
                fom: aktivitet.fom,
                tom: aktivitet.tom,
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
                type: 'GRADERT',
                fom: aktivitet.fom,
                tom: aktivitet.tom,
                grad: null,
            }
        case 'AVVENTENDE':
        case 'BEHANDLINGSDAGER':
        case 'REISETILSKUDD':
            logger.info(`Duplisering with aktivitet of type ${aktivitet.type} is not supported yet`)
            return null
    }
}
