import { logger } from '@navikt/next-logger'
import * as R from 'remeda'

import { DiagnoseFragment, SykmeldingFullFragment } from '@queries'
import { raise } from '@lib/ts'
import {
    AktivitetsPeriode,
    NySykmeldingMainFormValues,
    TilbakedateringField,
} from '@features/ny-sykmelding-form/form/types'
import { TilbakedateringGrunn } from '@data-layer/common/tilbakedatering'
import { Diagnose } from '@data-layer/common/diagnose'
import { dateOnly } from '@lib/date'

export function sykmeldingFragmentToNySykmeldingFormValues(
    sykmelding: SykmeldingFullFragment,
): Omit<NySykmeldingMainFormValues, 'perioder' | 'meldinger'> {
    return {
        tilbakedatering: toTilbakedatering(sykmelding.values.tilbakedatering),
        arbeidsforhold: sykmelding.values.arbeidsgiver?.harFlere
            ? {
                  harFlereArbeidsforhold: 'JA',
                  sykmeldtFraArbeidsforhold: sykmelding.values.arbeidsgiver.arbeidsgivernavn,
                  aaregArbeidsforhold: sykmelding.values.arbeidsgiver.arbeidsgivernavn,
              }
            : {
                  harFlereArbeidsforhold: 'NEI',
                  sykmeldtFraArbeidsforhold: null,
                  aaregArbeidsforhold: null,
              },
        andreSporsmal: {
            yrkesskade: sykmelding.values.yrkesskade
                ? {
                      yrkesskade: sykmelding.values.yrkesskade.yrkesskade,
                      skadedato: sykmelding.values.yrkesskade.skadedato ?? null,
                  }
                : null,
            svangerskapsrelatert: sykmelding.values.svangerskapsrelatert ?? false,
        },
        diagnoser: {
            hoved: sykmelding.values.hoveddiagnose
                ? {
                      code: sykmelding.values.hoveddiagnose.code,
                      system: sykmelding.values.hoveddiagnose.system,
                      text: sykmelding.values.hoveddiagnose.text,
                  }
                : raise('Form does not support sykmeldinger without hoveddiagnose yet'),
            bidiagnoser: sykmelding.values.bidiagnoser
                ? sykmelding.values.bidiagnoser.map((it) => ({
                      code: it.code,
                      system: it.system,
                      text: it.text,
                  }))
                : [],
        },
        utdypendeSporsmal: null,
    }
}

export function sykmeldingFragmentAktivitetToFormValue(
    periode: { fom: string; tom: string | null },
    aktivitet: SykmeldingFullFragment['values']['aktivitet'][0],
): AktivitetsPeriode {
    switch (aktivitet.__typename) {
        case 'AktivitetIkkeMulig':
            return {
                periode: {
                    fom: periode.fom,
                    tom: periode.tom,
                },
                aktivitet: {
                    type: 'AKTIVITET_IKKE_MULIG',
                    grad: null,
                },
                medisinskArsak: {
                    isMedisinskArsak: aktivitet.medisinskArsak?.isMedisinskArsak ?? false,
                },
                arbeidsrelatertArsak: {
                    isArbeidsrelatertArsak: aktivitet.arbeidsrelatertArsak?.isArbeidsrelatertArsak ?? false,
                    arbeidsrelaterteArsaker: aktivitet.arbeidsrelatertArsak?.arbeidsrelaterteArsaker ?? [],
                    annenArbeidsrelatertArsak: aktivitet.arbeidsrelatertArsak?.annenArbeidsrelatertArsak ?? null,
                },
            } satisfies AktivitetsPeriode

        case 'Gradert':
            return {
                periode: {
                    fom: periode.fom,
                    tom: periode.tom,
                },
                aktivitet: {
                    type: 'GRADERT',
                    grad: aktivitet.grad.toFixed(0),
                },
                medisinskArsak: null,
                arbeidsrelatertArsak: null,
            } satisfies AktivitetsPeriode

        case 'Reisetilskudd':
        case 'Avventende':
        case 'Behandlingsdager':
            logger.info(`Forlengelse with aktivitet of type ${aktivitet.type} is not supported yet`)
            return {
                // This should not happen unless the user forlengs sykmeldinger from a non-syk-inn source, but
                // this is in essence duplicated getDefaultPeriode from form-default-values.ts
                aktivitet: {
                    type: 'GRADERT',
                    grad: null,
                },
                periode: {
                    fom: dateOnly(new Date()),
                    tom: null,
                },
                arbeidsrelatertArsak: null,
                medisinskArsak: null,
            } satisfies AktivitetsPeriode
    }
}

export function serverDiagnoseSuggestionToFormValue(diagnose: DiagnoseFragment | null): Diagnose | null {
    if (diagnose == null) return null

    return R.omit(diagnose, ['__typename'])
}

function toTilbakedatering(
    tilbakedatering: SykmeldingFullFragment['values']['tilbakedatering'] | null,
): TilbakedateringField | null {
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
