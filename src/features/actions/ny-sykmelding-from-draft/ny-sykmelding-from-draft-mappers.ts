import { isValid, toDate } from 'date-fns'

import { NySykmeldingMainFormValues, NySykmeldingSuggestions } from '@features/ny-sykmelding-form/form/types'
import { DraftValues } from '@data-layer/draft/draft-schema'
import { NySykmeldingFormState } from '@core/redux/reducers/ny-sykmelding'
import { precedence } from '@features/ny-sykmelding-form/form/utils'
import {
    stateAndreSporsmalToFormValues,
    stateArbeidsforholdToFormValues,
    stateBidiagnoserToFormValues,
    stateHoveddiagnoseToFormValues,
    stateMeldingerToFormValues,
    statePerioderToFormValues,
    stateTilbakedateringToFormValues,
    stateUtdypendeSporsmalToFormValues,
} from '@features/actions/common/state-sykmelding-mappers'
import {
    defaultAndreSporsmal,
    defaultArbeidsforhold,
    defaultMeldinger,
    defaultPeriode,
    defaultTilbakedatering,
    defaultUtdypendeSporsmal,
} from '@features/ny-sykmelding-form/form/default-values'
import { serverDiagnoseSuggestionToFormValue } from '@features/actions/common/gql-sykmelding-mappers'

export function nySykmeldingFromDraftDefaultValues(
    draft: DraftValues | null,
    state: NySykmeldingFormState | null,
    serverSuggestions: NySykmeldingSuggestions,
): NySykmeldingMainFormValues {
    return {
        arbeidsforhold: precedence([
            stateArbeidsforholdToFormValues(state?.arbeidsforhold ?? null),
            draftArbeidsforholdToFormValues(draft?.arbeidsforhold ?? null),
            defaultArbeidsforhold(),
        ]),
        perioder: precedence([
            statePerioderToFormValues(state?.aktiviteter ?? null),
            draftPerioderToFormValues(draft?.perioder ?? null),
            [defaultPeriode()],
        ]),
        diagnoser: {
            hoved: precedence([
                stateHoveddiagnoseToFormValues(state?.diagnose?.hoved ?? null),
                draftHoveddiagnoseToFormValues(draft?.hoveddiagnose ?? null),
                serverDiagnoseSuggestionToFormValue(serverSuggestions.diagnose.value ?? null),
                null,
            ]),
            bidiagnoser: precedence([
                stateBidiagnoserToFormValues(state?.diagnose?.bi ?? null),
                draftBidiagnoserToFormValues(draft?.bidiagnoser ?? null),
                serverSuggestions.bidiagnoser?.map(serverDiagnoseSuggestionToFormValue) ?? null,
                [],
            ]),
        },
        tilbakedatering: precedence([
            stateTilbakedateringToFormValues(state?.tilbakedatering ?? null),
            draftTilbakedateringToFormValues(draft?.tilbakedatering ?? null),
            defaultTilbakedatering(),
        ]),
        meldinger: precedence([
            stateMeldingerToFormValues(state?.meldinger ?? null),
            draftMeldingerToFormValues(draft?.meldinger ?? null),
            defaultMeldinger(),
        ]),
        andreSporsmal: precedence([
            stateAndreSporsmalToFormValues(state?.andreSporsmal ?? null),
            draftAndreSporsmalToFormValues(draft),
            defaultAndreSporsmal(),
        ]),
        utdypendeSporsmal: precedence([
            stateUtdypendeSporsmalToFormValues(state?.utdypendeSporsmal ?? null),
            draftUtdypendeSporsmalToFormValues(draft?.utdypendeSporsmal ?? null),
            defaultUtdypendeSporsmal(),
        ]),
    }
}

function draftArbeidsforholdToFormValues(
    draftArbeidsforhold: DraftValues['arbeidsforhold'] | null,
): NySykmeldingMainFormValues['arbeidsforhold'] | null {
    if (draftArbeidsforhold == null) return null

    return {
        harFlereArbeidsforhold: draftArbeidsforhold.harFlereArbeidsforhold ?? null,
        sykmeldtFraArbeidsforhold: draftArbeidsforhold.sykmeldtFraArbeidsforhold ?? null,
        // Used only for feature-toggle: 'SYK_INN_AAREG'
        aaregArbeidsforhold: draftArbeidsforhold.sykmeldtFraArbeidsforhold ?? null,
    }
}

function draftPerioderToFormValues(
    draftPerioder: DraftValues['perioder'] | null,
): NySykmeldingMainFormValues['perioder'] | null {
    if (draftPerioder == null) return null

    return draftPerioder.map(toPeriodeFromDraftPeriode)
}

function toPeriodeFromDraftPeriode(
    draft: Exclude<DraftValues['perioder'], null>[number],
): NySykmeldingMainFormValues['perioder'][number] {
    const periode = {
        periode: {
            fom: draft.fom ?? '',
            tom: draft.tom ?? '',
        },
        aktivitet: {
            type: draft.type,
        },
    }
    switch (draft.type) {
        case 'AKTIVITET_IKKE_MULIG':
            return {
                ...periode,
                aktivitet: {
                    ...periode.aktivitet,
                    grad: null,
                },
                medisinskArsak: {
                    isMedisinskArsak: draft.medisinskArsak?.isMedisinskArsak ?? false,
                },
                arbeidsrelatertArsak: {
                    isArbeidsrelatertArsak: draft.arbeidsrelatertArsak?.isArbeidsrelatertArsak ?? false,
                    arbeidsrelaterteArsaker: draft.arbeidsrelatertArsak?.arbeidsrelaterteArsaker ?? null,
                    annenArbeidsrelatertArsak: draft.arbeidsrelatertArsak?.annenArbeidsrelatertArsak ?? null,
                },
            }
        case 'GRADERT':
            return {
                periode: {
                    fom: draft.fom ?? '',
                    tom: draft.tom ?? '',
                },
                aktivitet: {
                    type: draft.type,
                    grad: draft.grad ?? null,
                },
                medisinskArsak: null,
                arbeidsrelatertArsak: null,
            }
    }
}

function draftHoveddiagnoseToFormValues(
    draftHoveddiagnose: DraftValues['hoveddiagnose'] | null,
): NySykmeldingMainFormValues['diagnoser']['hoved'] | null {
    if (draftHoveddiagnose == null) return null

    return {
        system: draftHoveddiagnose.system,
        code: draftHoveddiagnose.code,
        text: draftHoveddiagnose.text,
    }
}

function draftBidiagnoserToFormValues(
    draftBidiagnoser: DraftValues['bidiagnoser'] | null,
): NySykmeldingMainFormValues['diagnoser']['bidiagnoser'] | null {
    if (draftBidiagnoser == null || draftBidiagnoser.length === 0) return null

    return draftBidiagnoser.map((it) => ({
        system: it.system,
        code: it.code,
        text: it.text,
    }))
}

function draftTilbakedateringToFormValues(
    draftTilbakemelding: DraftValues['tilbakedatering'] | null,
): NySykmeldingMainFormValues['tilbakedatering'] | null {
    if (draftTilbakemelding == null) return null

    return {
        fom: draftTilbakemelding.fom && isValid(toDate(draftTilbakemelding.fom)) ? draftTilbakemelding.fom : null,
        grunn: draftTilbakemelding.grunn ?? null,
        annenGrunn: draftTilbakemelding.annenGrunn ?? null,
    }
}

function draftMeldingerToFormValues(
    draftMeldinger: DraftValues['meldinger'] | null,
): NySykmeldingMainFormValues['meldinger'] | null {
    if (draftMeldinger == null) return null

    return {
        showTilNav: draftMeldinger.showTilNav ?? false,
        showTilArbeidsgiver: draftMeldinger.showTilArbeidsgiver ?? false,
        tilNav: draftMeldinger.tilNav ?? null,
        tilArbeidsgiver: draftMeldinger.tilArbeidsgiver ?? null,
    }
}

function draftAndreSporsmalToFormValues(
    draftValues: DraftValues | null,
): NySykmeldingMainFormValues['andreSporsmal'] | null {
    if (draftValues == null) return null

    return {
        svangerskapsrelatert: draftValues.svangerskapsrelatert ?? false,
        yrkesskade: {
            yrkesskade: draftValues.yrkesskade?.yrkesskade ?? false,
            skadedato: draftValues.yrkesskade?.skadedato ?? null,
        },
    }
}

function draftUtdypendeSporsmalToFormValues(
    draftUtdypendeSporsmal: DraftValues['utdypendeSporsmal'] | null,
): NySykmeldingMainFormValues['utdypendeSporsmal'] | null {
    if (draftUtdypendeSporsmal == null) return null

    return {
        utfodringerMedArbeid: draftUtdypendeSporsmal.utfodringerMedArbeid ?? null,
        medisinskOppsummering: draftUtdypendeSporsmal.medisinskOppsummering ?? null,
        hensynPaArbeidsplassen: draftUtdypendeSporsmal.hensynPaArbeidsplassen ?? null,
    }
}
