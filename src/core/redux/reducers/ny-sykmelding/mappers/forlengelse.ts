import * as R from 'remeda'
import { logger } from '@navikt/next-logger'
import { addDays } from 'date-fns'

import { SykmeldingFragment } from '@queries'
import { raise } from '@lib/ts'
import { dateOnly } from '@lib/date'
import { NySykmeldingAktivitet, NySykmeldingFormState } from '@core/redux/reducers/ny-sykmelding'
import { sykmeldingFragmentToMainStepStateNoAktivitet } from '@data-layer/common/sykmelding-fragment-to-multistep-state'

export function forlengSykmelding(sykmelding: SykmeldingFragment): NySykmeldingFormState {
    const forlengetAktivitet = toForlengelsesAktivitet(sykmelding.values.aktivitet)

    return {
        ...sykmeldingFragmentToMainStepStateNoAktivitet(sykmelding),
        aktiviteter: [forlengetAktivitet],
    }
}

function toForlengelsesAktivitet(previousAktivitet: SykmeldingFragment['values']['aktivitet']): NySykmeldingAktivitet {
    const latestPeriode = R.firstBy(previousAktivitet, [(it) => it.fom, 'desc'])
    if (!latestPeriode) {
        raise('Sykmelding without aktivitetsperioder, this should not happen')
    }

    const nextFom = dateOnly(addDays(latestPeriode.tom, 1))

    switch (latestPeriode.__typename) {
        case 'AktivitetIkkeMulig':
            return {
                type: 'AKTIVITET_IKKE_MULIG',
                fom: nextFom,
                tom: null,
                medisinskArsak: {
                    isMedisinskArsak: latestPeriode.medisinskArsak?.isMedisinskArsak ?? false,
                },
                arbeidsrelatertArsak: {
                    isArbeidsrelatertArsak: latestPeriode.arbeidsrelatertArsak?.isArbeidsrelatertArsak ?? false,
                    arbeidsrelaterteArsaker: latestPeriode.arbeidsrelatertArsak?.arbeidsrelaterteArsaker ?? [],
                    annenArbeidsrelatertArsak: latestPeriode.arbeidsrelatertArsak?.annenArbeidsrelatertArsak ?? null,
                },
            } satisfies NySykmeldingAktivitet

        case 'Gradert':
            return {
                type: 'GRADERT',
                fom: nextFom,
                tom: null,
                grad: latestPeriode.grad,
            } satisfies NySykmeldingAktivitet

        case 'Reisetilskudd':
        case 'Avventende':
        case 'Behandlingsdager':
            logger.info(`Forlengelse with aktivitet of type ${latestPeriode.type} is not supported yet`)
            return {
                // This should not happen unless the user forlengs sykmeldinger from a non-syk-inn source, but
                // this is in essence duplicated getDefaultPeriode from form-default-values.ts
                type: 'GRADERT',
                grad: null,
                fom: dateOnly(new Date()),
                tom: null,
            } satisfies NySykmeldingAktivitet
    }
}
