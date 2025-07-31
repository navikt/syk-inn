import { useEffect, useState } from 'react'
import { useQuery } from '@apollo/client'
import { logger } from '@navikt/next-logger'

import { useAppDispatch } from '@core/redux/hooks'
import { GetDraftDocument } from '@queries'
import { nySykmeldingActions, NySykmeldingFormState } from '@core/redux/reducers/ny-sykmelding'
import { safeParseDraft } from '@data-layer/draft/draft-schema'

import { useDraftId } from '../draft/useDraftId'
import { createDefaultFormValues } from '../form-default-values'
import { formValuesToStatePayload } from '../form-mappers'

type UseFormValuesSummaryDraft = {
    draftLoading: boolean
}

export function useFormValuesSummaryDraft(values: NySykmeldingFormState | null): UseFormValuesSummaryDraft {
    const draftId = useDraftId()
    const dispatch = useAppDispatch()
    const [hasTriedDrafting, setHasTriedDrafting] = useState<boolean>(false)
    const draftQuery = useQuery(GetDraftDocument, {
        variables: { draftId: draftId },
        fetchPolicy: 'cache-first',
    })

    useEffect(() => {
        if (hasTriedDrafting) return

        if (!draftQuery.loading && values == null && draftQuery.data?.draft != null) {
            logger.info('Found existing draft when loading Summary page! Trying to load it into form state. :-)')

            const formValuesFromDraft = createDefaultFormValues({
                draftValues: safeParseDraft(draftQuery.data?.draft?.draftId, draftQuery.data?.draft?.values),
                valuesInState: null,
                serverSuggestions: { diagnose: { value: null } },
            })

            try {
                const payload = formValuesToStatePayload(formValuesFromDraft)
                dispatch(nySykmeldingActions.completeForm(payload))
            } catch (e) {
                logger.error(
                    new Error('Tried to handle draft being loaded on Summary page, but form values were incomplete', {
                        cause: e,
                    }),
                )
            } finally {
                setHasTriedDrafting(true)
            }
        }
    }, [hasTriedDrafting, draftQuery.loading, values, draftQuery.data?.draft, dispatch])

    return {
        draftLoading: draftQuery.loading,
    }
}
