import { useEffect, useMemo, useRef } from 'react'
import * as R from 'remeda'
import { FetchResult, useMutation } from '@apollo/client'
import { toast } from 'sonner'
import { useParams } from 'next/navigation'

import { GetAllDraftsDocument, SaveDraftDocument, SaveDraftMutation } from '@queries'

import { NySykmeldingMainFormValues, useFormContext } from '../form'

type Changes = {
    currentValues: NySykmeldingMainFormValues
    currentServerValues: NySykmeldingMainFormValues | null
}

/**
 * Some complexity warning
 *
 * This component listens to form changes and saves the draft. It's built to be robust and not
 * hammer the backend. It both debounces on changes, but also handles slow responses from the backend.
 *
 * Fingers crossed for no endless useEffect-DDOS-loops.
 */
function FormDraftSync(): null {
    const { draftId } = useParams<{ draftId: string }>()
    const { formValues, isFormDirty } = useFormValues()

    const currentMutationPromise = useRef<Promise<FetchResult<SaveDraftMutation>> | null>(null)
    const [mutation, draftResult] = useMutation(SaveDraftDocument, {
        onCompleted: () => {
            currentMutationPromise.current = null

            toast('Lagret utkast')
        },
        refetchQueries: [GetAllDraftsDocument],
    })

    const debouncedSaveDraft = useMemo(
        () =>
            R.funnel(
                async (args) => {
                    /**
                     * There is currently a (slow) mutation still running. This will only happen if the requset
                     * somehow is slower than the debounce time. But in this case we'll wait for the in-flight mutation
                     * to finish, then compare the form-values with that response instead, since it will be the most up-to-date
                     */
                    if (currentMutationPromise.current != null) {
                        const result = await currentMutationPromise.current

                        if (shouldUpdate(args.currentValues, result.data?.saveDraft.values)) {
                            const mutationPromise = mutation({ variables: { draftId, values: args.currentValues } })
                            currentMutationPromise.current = mutationPromise
                            return mutationPromise
                        }

                        /**
                         * The fresh result from the in-flight mutation is the same as the current form values,
                         * we don't need to update the draft.
                         */
                        return
                    }

                    /**
                     * No in-flight mutation, we can safely compare the current form values with the saved draft from
                     * the previous mutation.
                     */
                    if (shouldUpdate(args.currentValues, args.currentServerValues)) {
                        const mutationPromise = mutation({ variables: { draftId, values: args.currentValues } })
                        currentMutationPromise.current = mutationPromise
                        return mutationPromise
                    }

                    /**
                     * The current form values are the same as the saved draft, we don't need to update the draft.
                     */
                    return
                },
                {
                    triggerAt: 'end',
                    minQuietPeriodMs: 2500,
                    reducer: (
                        _: Changes | undefined,
                        currentValues: NySykmeldingMainFormValues,
                        currentServerValues: NySykmeldingMainFormValues | null,
                    ): Changes => ({
                        currentValues: currentValues,
                        currentServerValues: currentServerValues,
                    }),
                },
            ),
        [draftId, mutation],
    )

    useEffect(() => {
        if (!isFormDirty) return

        // TODO: Typing here needs to be improved together with the rest of the draft types.
        debouncedSaveDraft.call(formValues, draftResult.data?.saveDraft.values as NySykmeldingMainFormValues | null)
    }, [isFormDirty, formValues, debouncedSaveDraft, draftResult.data])

    return null
}

function useFormValues(): { formValues: NySykmeldingMainFormValues; isFormDirty: boolean } {
    const {
        watch,
        formState: { isDirty },
    } = useFormContext()
    const values = watch()

    return {
        formValues: values,
        isFormDirty: isDirty,
    }
}

function shouldUpdate(values: NySykmeldingMainFormValues, savedDraft: unknown): boolean {
    if (!savedDraft) return true

    return !R.isDeepEqual(values, savedDraft)
}

export default FormDraftSync
