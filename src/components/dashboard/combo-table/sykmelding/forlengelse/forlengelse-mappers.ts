import * as R from 'remeda'
import { logger } from '@navikt/next-logger'
import { addDays } from 'date-fns'

import { SykmeldingFragment } from '@queries'
import { raise } from '@utils/ts'
import { dateOnly } from '@utils/date'

import {
    AktivitetStep,
    nySykmeldingMultistepActions,
} from '../../../../../providers/redux/reducers/ny-sykmelding-multistep'

type Payload = Parameters<typeof nySykmeldingMultistepActions.completeMainStep>[0]

export function forlengSykmelding(sykmelding: SykmeldingFragment): Payload {
    const forlengetAktivitet = toForlengelsesAktivitet(sykmelding.values.aktivitet)

    return {
        meldinger: {
            showTilArbeidsgiver: sykmelding.values.meldinger.tilArbeidsgiver != null,
            tilArbeidsgiver: sykmelding.values.meldinger.tilArbeidsgiver ?? null,
            showTilNav: sykmelding.values.meldinger.tilNav != null,
            tilNav: sykmelding.values.meldinger.tilNav ?? null,
        },
        tilbakedatering: sykmelding.values.tilbakedatering
            ? {
                  fom: sykmelding.values.tilbakedatering.startdato,
                  grunn: sykmelding.values.tilbakedatering.begrunnelse,
              }
            : null,
        arbeidsforhold: sykmelding.values.arbeidsgiver?.harFlere
            ? {
                  harFlereArbeidsforhold: true,
                  sykmeldtFraArbeidsforhold: sykmelding.values.arbeidsgiver.arbeidsgivernavn,
              }
            : null,
        andreSporsmal: {
            yrkesskade: sykmelding.values.yrkesskade?.yrkesskade ?? false,
            yrkesskadeDato: sykmelding.values.yrkesskade?.skadedato ?? null,
            svangerskapsrelatert: sykmelding.values.svangerskapsrelatert ?? false,
        },
        diagnose: {
            hoved:
                sykmelding.values.hoveddiagnose ??
                raise('Form does not support sykmeldinger without hoveddiagnose yet'),
            // TODO: Support bi
            bi: [],
        },
        aktiviteter: [forlengetAktivitet],
    }
}

function toForlengelsesAktivitet(previousAktivitet: SykmeldingFragment['values']['aktivitet']): AktivitetStep {
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
                    isMedisinskArsak: latestPeriode.medisinskArsak.isMedisinskArsak,
                },
                arbeidsrelatertArsak: {
                    isArbeidsrelatertArsak: latestPeriode.arbeidsrelatertArsak?.isArbeidsrelatertArsak,
                    arbeidsrelaterteArsaker: latestPeriode.arbeidsrelatertArsak?.arbeidsrelaterteArsaker,
                    annenArbeidsrelatertArsak: latestPeriode.arbeidsrelatertArsak?.annenArbeidsrelatertArsak ?? null,
                },
            } satisfies AktivitetStep

        case 'Gradert':
            return {
                type: 'GRADERT',
                fom: nextFom,
                tom: null,
                grad: latestPeriode.grad,
            } satisfies AktivitetStep

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
            } satisfies AktivitetStep
    }
}
