import { NySykmeldingFormState } from '@core/redux/reducers/ny-sykmelding'
import { NySykmeldingMainFormValues, NySykmeldingSuggestions } from '@features/ny-sykmelding-form/form/types'
import { precedence } from '@features/ny-sykmelding-form/form/utils'
import {
    defaultAndreSporsmal,
    defaultAnnenfravarsgrunn,
    defaultArbeidsforhold,
    defaultMeldinger,
    defaultPeriode,
    defaultTilbakedatering,
    defaultUtdypendeSporsmal,
} from '@features/ny-sykmelding-form/form/default-values'
import { NySykmeldingFormVariantType } from '@features/ny-sykmelding-form/useFormVariant'

import {
    stateAndreSporsmalToFormValues,
    stateAnnenFravarsgrunnToFormValues,
    stateArbeidsforholdToFormValues,
    stateBidiagnoserToFormValues,
    stateHoveddiagnoseToFormValues,
    stateMeldingerToFormValues,
    statePerioderToFormValues,
    stateTilbakedateringToFormValues,
    stateUtdypendeSporsmalToFormValues,
} from '../common/state-sykmelding-mappers'
import { serverDiagnoseSuggestionToFormValue } from '../common/gql-sykmelding-mappers'

export function nySykmeldingDefaultValues(
    state: NySykmeldingFormState | null,
    serverSuggestions: NySykmeldingSuggestions | null,
    variant: NySykmeldingFormVariantType,
): NySykmeldingMainFormValues {
    return {
        arbeidsforhold: precedence([
            stateArbeidsforholdToFormValues(state?.arbeidsforhold ?? null),
            defaultArbeidsforhold(),
        ]),
        perioder: precedence([statePerioderToFormValues(state?.aktiviteter ?? null), [defaultPeriode(variant)]]),
        diagnoser: {
            hoved: precedence([
                stateHoveddiagnoseToFormValues(state?.diagnose?.hoved ?? null),
                serverDiagnoseSuggestionToFormValue(serverSuggestions?.diagnose.value ?? null),
                null,
            ]),
            bidiagnoser: precedence([
                stateBidiagnoserToFormValues(state?.diagnose?.bi ?? null),
                serverSuggestions?.bidiagnoser?.map(serverDiagnoseSuggestionToFormValue) ?? null,
                [],
            ]),
        },
        tilbakedatering: precedence([
            stateTilbakedateringToFormValues(state?.tilbakedatering ?? null),
            defaultTilbakedatering(),
        ]),
        meldinger: precedence([stateMeldingerToFormValues(state?.meldinger ?? null), defaultMeldinger(variant)]),
        andreSporsmal: precedence([
            stateAndreSporsmalToFormValues(state?.andreSporsmal ?? null),
            defaultAndreSporsmal(),
        ]),
        utdypendeSporsmal: precedence([
            stateUtdypendeSporsmalToFormValues(state?.utdypendeSporsmal ?? null),
            defaultUtdypendeSporsmal(),
        ]),
        annenFravarsgrunn: precedence([
            stateAnnenFravarsgrunnToFormValues(state?.annenFravarsgrunn ?? null),
            defaultAnnenfravarsgrunn(),
        ]),
    }
}
