import { skipToken, useQuery } from '@apollo/client/react'
import { logger } from '@navikt/next-logger'
import { useEffect, useState } from 'react'

import { useAppDispatch } from '#core/redux/hooks'
import { nySykmeldingActions, NySykmeldingFormState } from '#core/redux/reducers/ny-sykmelding'
import { inferSykmeldingTypeFromDraft, safeParseDraft } from '#data-layer/draft/draft-schema'
import { nySykmeldingFromDraftDefaultValues } from '#features/actions/ny-sykmelding-from-draft/ny-sykmelding-from-draft-mappers'
import { GetDraftDocument } from '#queries'

import { useDraftId } from '../draft/useDraftId'
import { formValuesToStatePayload } from '../form/form-to-state'

type UseFormValuesSummaryDraft = {
    draftLoading: boolean
}

export function useFormValuesSummaryDraft(values: NySykmeldingFormState | null): UseFormValuesSummaryDraft {
    const [draftId] = useDraftId()
    const dispatch = useAppDispatch()
    const [hasTriedDrafting, setHasTriedDrafting] = useState<boolean>(false)
    const draftQuery = useQuery(
        GetDraftDocument,
        draftId != null
            ? {
                  variables: { draftId: draftId },
                  fetchPolicy: 'cache-first',
              }
            : skipToken,
    )

    useEffect(() => {
        if (hasTriedDrafting) return

        if (!draftQuery.loading && values == null && draftQuery.data?.draft != null) {
            logger.info('Found existing draft when loading Summary page! Trying to load it into form state. :-)')

            const parsedDraft = safeParseDraft(draftQuery.data?.draft?.draftId, draftQuery.data?.draft?.values)
            const variantInDraft = inferSykmeldingTypeFromDraft(parsedDraft)
            const formValuesFromDraft = nySykmeldingFromDraftDefaultValues(
                parsedDraft,
                null,
                {
                    diagnose: { value: null },
                    bidiagnoser: null,
                },
                variantInDraft,
            )

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
