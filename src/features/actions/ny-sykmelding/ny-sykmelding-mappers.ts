import { NySykmeldingMainFormValues, NySykmeldingSuggestions } from '@features/ny-sykmelding-form/form/types'
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

export function nySykmeldingDefaultValues(
    state: NySykmeldingFormState | null,
    serverSuggestions: NySykmeldingSuggestions,
): NySykmeldingMainFormValues {
    return {
        arbeidsforhold: precedence([
            stateArbeidsforholdToFormValues(state?.arbeidsforhold ?? null),
            defaultArbeidsforhold(),
        ]),
        perioder: precedence([statePerioderToFormValues(state?.aktiviteter ?? null), [defaultPeriode()]]),
        diagnoser: {
            hoved: precedence([
                stateHoveddiagnoseToFormValues(state?.diagnose?.hoved ?? null),
                serverDiagnoseSuggestionToFormValue(serverSuggestions.diagnose.value ?? null),
                null,
            ]),
            bidiagnoser: precedence([
                stateBidiagnoserToFormValues(state?.diagnose?.bi ?? null),
                serverSuggestions.bidiagnoser?.map(serverDiagnoseSuggestionToFormValue) ?? null,
                [],
            ]),
        },
        tilbakedatering: precedence([
            stateTilbakedateringToFormValues(state?.tilbakedatering ?? null),
            defaultTilbakedatering(),
        ]),
        meldinger: precedence([stateMeldingerToFormValues(state?.meldinger ?? null), defaultMeldinger()]),
        andreSporsmal: precedence([
            stateAndreSporsmalToFormValues(state?.andreSporsmal ?? null),
            defaultAndreSporsmal(),
        ]),
        utdypendeSporsmal: precedence([
            stateUtdypendeSporsmalToFormValues(state?.utdypendeSporsmal ?? null),
            defaultUtdypendeSporsmal(),
        ]),
    }
}
