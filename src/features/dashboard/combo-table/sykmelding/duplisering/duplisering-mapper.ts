import * as R from 'remeda'
import { logger } from '@navikt/next-logger'

import { SykmeldingFragment } from '@queries'
import { AktivitetStep, nySykmeldingActions } from '@core/redux/reducers/ny-sykmelding'
import { sykmeldingFragmentToMainStepStateNoAktivitet } from '@data-layer/common/sykmelding-fragment-to-multistep-state'

type Payload = Parameters<typeof nySykmeldingActions.completeMainStep>[0]

export function dupliserSykmelding(sykmelding: SykmeldingFragment): Payload {
    return {
        ...sykmeldingFragmentToMainStepStateNoAktivitet(sykmelding),
        aktiviteter: sykmelding.values.aktivitet.map(toDuplisertAktivitet).filter(R.isNonNull),
    }
}

function toDuplisertAktivitet(aktivitet: SykmeldingFragment['values']['aktivitet'][0]): AktivitetStep | null {
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
            } satisfies AktivitetStep

        case 'Gradert':
            return {
                type: 'GRADERT',
                fom: aktivitet.fom,
                tom: aktivitet.tom,
                grad: aktivitet.grad,
            } satisfies AktivitetStep

        case 'Reisetilskudd':
        case 'Avventende':
        case 'Behandlingsdager':
            logger.info(`Duplisering with aktivitet of type ${aktivitet.type} is not supported yet`)
            return null
    }
}
