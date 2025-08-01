import * as R from 'remeda'
import { logger } from '@navikt/next-logger'
import { addDays } from 'date-fns'

import { SykmeldingFragment, SykmeldingFullFragment, SykmeldingLightFragment } from '@queries'
import { raise } from '@lib/ts'
import { dateOnly } from '@lib/date'
import { NySykmeldingAktivitet, NySykmeldingFormState } from '@core/redux/reducers/ny-sykmelding'
import { sykmeldingFragmentToMainStepStateNoAktivitet } from '@data-layer/common/sykmelding-fragment-to-multistep-state'

export function forlengSykmelding(sykmelding: SykmeldingFragment): NySykmeldingFormState {
    if (sykmelding.__typename === 'SykmeldingLight') {
        return forlengLightSykmelding(sykmelding)
    }

    const forlengetAktivitet = toForlengelsesAktivitet(sykmelding.values.aktivitet)

    return {
        ...sykmeldingFragmentToMainStepStateNoAktivitet(sykmelding),
        aktiviteter: [forlengetAktivitet],
    }
}

function toForlengelsesAktivitet(
    previousAktivitet: SykmeldingFullFragment['values']['aktivitet'],
): NySykmeldingAktivitet {
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

function forlengLightSykmelding(sykmelding: SykmeldingLightFragment): NySykmeldingFormState {
    const latestPeriode = R.firstBy(sykmelding.values.aktivitet, [(it) => it.fom, 'desc'])
    if (!latestPeriode) {
        raise('Sykmelding without aktivitetsperioder, this should not happen')
    }

    const nextFom = dateOnly(addDays(latestPeriode.tom, 1))

    let nextAkvititet: NySykmeldingAktivitet
    switch (latestPeriode.type) {
        case 'AKTIVITET_IKKE_MULIG':
            nextAkvititet = {
                type: 'AKTIVITET_IKKE_MULIG',
                fom: nextFom,
                tom: null,
                medisinskArsak: {
                    isMedisinskArsak: true,
                },
                arbeidsrelatertArsak: {
                    isArbeidsrelatertArsak: false,
                    arbeidsrelaterteArsaker: null,
                    annenArbeidsrelatertArsak: null,
                },
            }
            break
        case 'GRADERT':
            nextAkvititet = {
                type: 'GRADERT',
                fom: nextFom,
                tom: null,
                grad: null,
            }
            break
        case 'AVVENTENDE':
        case 'BEHANDLINGSDAGER':
        case 'REISETILSKUDD':
            logger.info(`Forlengelse with aktivitet of type ${latestPeriode.type} is not supported yet`)
            nextAkvititet = {
                // This should not happen unless the user forlengs sykmeldinger from a non-syk-inn source, but
                // this is in essence duplicated getDefaultPeriode from form-default-values.ts
                type: 'GRADERT',
                grad: null,
                fom: dateOnly(new Date()),
                tom: null,
            } satisfies NySykmeldingAktivitet
    }

    return {
        aktiviteter: [nextAkvititet],
        arbeidsforhold: null,
        tilbakedatering: null,
        diagnose: null,
        meldinger: null,
        andreSporsmal: null,
    }
}
