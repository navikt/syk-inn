import { createContext, PropsWithChildren, ReactElement, useContext, useMemo } from 'react'
import { useMutation } from '@apollo/client/react'

import { SaveDraftMutation, SaveDraftMutationVariables } from '@queries'
import { useFormDraftSyncInternals } from '@features/ny-sykmelding-form/draft/internals/FormDraftSyncInternals'

type FormDraftSync = {
    /**
     * Cancels any pending debounced saves, and saves the draft immediately with the current form values.
     */
    saveDraft: () => ReturnType<useMutation.MutationFunction<SaveDraftMutation, SaveDraftMutationVariables>>
    /**
     * Immediately cancels any pending draft saves. Does NOT save the current form values.
     */
    cancelSync: () => void
    /**
     * Always contains the most up to date loading state and result of the previous saved drat.
     */
    result: useMutation.Result<SaveDraftMutation>
}

const FormDraftSyncContext = createContext<FormDraftSync | null>(null)

export function FormDraftSync({ children }: PropsWithChildren): ReactElement {
    const { saveImmediately, cancelSync, result } = useFormDraftSyncInternals()

    const providerValues = useMemo(
        (): FormDraftSync => ({
            saveDraft: saveImmediately,
            cancelSync,
            result,
        }),
        [saveImmediately, cancelSync, result],
    )

    return <FormDraftSyncContext.Provider value={providerValues}>{children}</FormDraftSyncContext.Provider>
}

export function useFormDraftSync(): FormDraftSync {
    const context = useContext(FormDraftSyncContext)
    if (!context) {
        throw new Error('useFormDraftSync must be used within a FormDraftSyncProvider')
    }
    return context
}
