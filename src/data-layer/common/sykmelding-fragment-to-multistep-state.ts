import { SykmeldingFragment } from '@queries'
import { raise } from '@utils/ts'

import { nySykmeldingMultistepActions } from '../../providers/redux/reducers/ny-sykmelding-multistep'

type Payload = Parameters<typeof nySykmeldingMultistepActions.completeMainStep>[0]

export function sykmeldingFragmentToMainStepStateNoAktivitet(
    sykmelding: SykmeldingFragment,
): Omit<Payload, 'aktiviteter'> {
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
    }
}
