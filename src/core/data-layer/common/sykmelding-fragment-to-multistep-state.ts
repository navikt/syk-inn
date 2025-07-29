import { SykmeldingFragment } from '@queries'
import { raise } from '@lib/ts'
import { nySykmeldingActions } from '@core/redux/reducers/ny-sykmelding'
import { TilbakedateringGrunn } from '@data-layer/common/tilbakedatering'

type Payload = Parameters<typeof nySykmeldingActions.completeForm>[0]

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
        tilbakedatering: toTilbakedatering(sykmelding.values.tilbakedatering),
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
            hoved: sykmelding.values.hoveddiagnose
                ? {
                      code: sykmelding.values.hoveddiagnose.code,
                      system: sykmelding.values.hoveddiagnose.system,
                      text: sykmelding.values.hoveddiagnose.text,
                  }
                : raise('Form does not support sykmeldinger without hoveddiagnose yet'),
            bi: sykmelding.values.bidiagnoser
                ? sykmelding.values.bidiagnoser.map((it) => ({
                      code: it.code,
                      system: it.system,
                      text: it.text,
                  }))
                : [],
        },
    }
}

function toTilbakedatering(
    tilbakedatering: SykmeldingFragment['values']['tilbakedatering'] | null,
): Payload['tilbakedatering'] | null {
    if (!tilbakedatering) {
        return null
    }

    const grunn = toTilbakedateringGrunn(tilbakedatering.begrunnelse)

    return {
        fom: tilbakedatering.startdato,
        grunn: grunn,
        annenGrunn: grunn === 'ANNET' ? tilbakedatering.begrunnelse : null,
    }
}

function toTilbakedateringGrunn(begrunnelse: string): TilbakedateringGrunn {
    switch (begrunnelse) {
        case 'Ventetid på legetime':
            return 'VENTETID_LEGETIME'
        case 'Manglende sykdomsinnsikt grunnet alvorlig psykisk sykdom':
            return 'MANGLENDE_SYKDOMSINNSIKT_GRUNNET_ALVORLIG_PSYKISK_SYKDOM'
        default:
            return 'ANNET'
    }
}
