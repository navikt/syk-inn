import { useEffect, useMemo, useRef } from 'react'
import * as R from 'remeda'
import { FetchResult } from '@apollo/client'
import { useParams } from 'next/navigation'
import { logger } from '@navikt/next-logger'
import { teamLogger } from '@navikt/next-logger/team-log'

import { SaveDraftMutation } from '@queries'
import { mapFormValuesToDraftValues, useSaveDraft } from '@components/ny-sykmelding-form/draft/useSaveDraft'
import { bundledEnv } from '@utils/env'

import { NySykmeldingMainFormValues, useFormContext } from '../form'
import { DraftValues, safeParseDraft } from '../../../data-layer/draft/draft-schema'

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
    const [mutation, draftResult] = useSaveDraft({
        returnToDash: false,
        onCompleted: () => {
            currentMutationPromise.current = null
        },
    })

    const debouncedSaveDraft = useMemo(
        () =>
            R.funnel(
                async (args) => {
                    const doMutation = async (): Promise<void> => {
                        const mutationPromise = mutation(draftId, args.currentValues)
                        currentMutationPromise.current = mutationPromise
                        await mutationPromise
                    }

                    /**
                     * There is currently a (slow) mutation still running. This will only happen if the request
                     * somehow is slower than the debounce time. But in this case we'll wait for the in-flight mutation
                     * to finish, then compare the form-values with that response instead, since it will be the most up-to-date
                     */
                    if (currentMutationPromise.current != null) {
                        const result = await currentMutationPromise.current

                        if (shouldUpdate(args.currentValues, result.data?.saveDraft.values)) {
                            await doMutation()
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
                        await doMutation()
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

    useEffect(() => {
        /**
         * This effect exists solely to ensure that the debounced function is flushed when the component is unmounted.
         */
        return () => {
            debouncedSaveDraft.flush()
        }
    }, [debouncedSaveDraft])

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

    const parsedSaved = safeParseDraft(null, savedDraft)
    const mappedFormValues = mapFormValuesToDraftValues(values)

    if (bundledEnv.runtimeEnv !== 'prod-gcp') {
        detectBadState(mappedFormValues)
    }

    return !R.isDeepEqual(parsedSaved, mappedFormValues)
}

function detectBadState(formValues: DraftValues): void {
    const stringifedValues = JSON.stringify(formValues, null, 2)
    const hasTypeName = stringifedValues.includes('__typename')
    if (hasTypeName) {
        logger.error(
            'Draft values contain __typename, which is not expected. This might cause issues with the draft saving. See team logs for object.',
        )
        teamLogger.error(`Diff engine detected __typename in form values: ${stringifedValues}`)
    }
}

export default FormDraftSync
