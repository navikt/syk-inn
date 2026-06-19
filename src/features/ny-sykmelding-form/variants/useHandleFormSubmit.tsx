import { useAppDispatch } from '#core/redux/hooks'
import { nySykmeldingActions } from '#core/redux/reducers/ny-sykmelding'

import { useFormDraftSync } from '../draft/FormDraftSync'
import { formValuesToStatePayload } from '../form/form-to-state'
import { NySykmeldingMainFormValues } from '../form/types'
import { useFormStep } from '../useFormStep'

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
