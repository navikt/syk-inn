import { nySykmeldingSlice } from './ny-sykmelding-slice'

export type { ActivePatient } from '@core/redux/reducers/ny-sykmelding/patient'
export type {
    NySykmeldingFormState,
    NySykmeldingArbeidsforhold,
    NySykmeldingAndreSporsmal,
    NySykmeldingTilbakedatering,
    NySykmeldingAktivitet,
    NySykmeldingMeldinger,
    NySykmeldingDiagnoser,
} from '@core/redux/reducers/ny-sykmelding/form'

export type { NySykmeldingState } from './ny-sykmelding-slice'

export const nySykmeldingActions = nySykmeldingSlice.actions
export const nySykmeldingReducer = nySykmeldingSlice.reducer
