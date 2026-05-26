import { useAppDispatch } from '@core/redux/hooks'
import { nySykmeldingActions } from '@core/redux/reducers/ny-sykmelding'

import { useFormStep } from '../useFormStep'
import { useFormDraftSync } from '../draft/FormDraftSync'
import { NySykmeldingMainFormValues } from '../form/types'
import { formValuesToStatePayload } from '../form/form-to-state'

export function useHandleFormSubmit() {
    const [, setStep] = useFormStep()
    const dispatch = useAppDispatch()
    const draftSync = useFormDraftSync()

    return async (values: NySykmeldingMainFormValues): Promise<void> => {
        dispatch(nySykmeldingActions.completeForm(formValuesToStatePayload(values)))

        await draftSync.saveDraft()
        await setStep('summary')
    }
}
