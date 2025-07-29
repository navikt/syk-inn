import { nySykmeldingSlice } from './ny-sykmelding-slice'

export type {
    AktivitetStep,
    MainSectionValues,
    AndreSporsmalStep,
    ArbeidsforholdStep,
    MeldingerStep,
    DiagnoseStep,
    TilbakedateringGrunn,
    TilbakedateringStep,
    PasientStep,
    NySykmeldingMultiStepState,
} from './ny-sykmelding-slice'

export const nySykmeldingActions = nySykmeldingSlice.actions
export const nySykmeldingReducer = nySykmeldingSlice.reducer
