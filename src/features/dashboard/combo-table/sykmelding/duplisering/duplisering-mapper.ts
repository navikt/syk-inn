import * as R from 'remeda'
import { logger } from '@navikt/next-logger'

import { SykmeldingFragment } from '@queries'
import { NySykmeldingAktivitet, nySykmeldingActions } from '@core/redux/reducers/ny-sykmelding'
import { sykmeldingFragmentToMainStepStateNoAktivitet } from '@data-layer/common/sykmelding-fragment-to-multistep-state'

type Payload = Parameters<typeof nySykmeldingActions.completeForm>[0]

export function dupliserSykmelding(sykmelding: SykmeldingFragment): Payload {
    return {
        ...sykmeldingFragmentToMainStepStateNoAktivitet(sykmelding),
        aktiviteter: sykmelding.values.aktivitet.map(toDuplisertAktivitet).filter(R.isNonNull),
    }
}

function toDuplisertAktivitet(aktivitet: SykmeldingFragment['values']['aktivitet'][0]): NySykmeldingAktivitet | null {
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
