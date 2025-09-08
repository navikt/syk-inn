import React, { ReactElement } from 'react'
import { useMutation } from '@apollo/client/react'
import { useRouter } from 'next/navigation'
import { FloppydiskIcon } from '@navikt/aksel-icons'

import { CacheIds } from '@data-layer/graphql/apollo/apollo-client-cache'
import { DeleteDraftDocument, GetAllDraftsDocument } from '@queries'
import { ShortcutButtons } from '@components/shortcut/ShortcutButtons'
import { spanBrowserAsync } from '@lib/otel/browser'
import { useAppDispatch } from '@core/redux/hooks'
import { nySykmeldingActions } from '@core/redux/reducers/ny-sykmelding'
import { useMode } from '@core/providers/Modes'

import { useFormContext } from '../form'

import { useSaveDraft } from './useSaveDraft'
import { useDraftId } from './useDraftId'

export function LagreDraftButton(): ReactElement {
    const [draftId, setDraftId] = useDraftId()
    const { getValues } = useFormContext()
    const [mutation, draftResult] = useSaveDraft({
        returnToDash: true,
        onCompleted: () => {
            dispatch(nySykmeldingActions.reset())
        },
    })
    const dispatch = useAppDispatch()

    return (
        <ShortcutButtons
            variant="secondary"
            icon={<FloppydiskIcon aria-hidden />}
            iconPosition="right"
            onClick={async () => {
                const draftIdToUse = draftId ?? crypto.randomUUID()
                if (draftId == null) await setDraftId(draftIdToUse)

                const values = getValues()
                await mutation(draftIdToUse, values)
            }}
            loading={draftResult.loading}
            shortcut={{
                modifier: 'alt',
                key: 's',
            }}
        >
            Lagre (utkast)
        </ShortcutButtons>
    )
}

function ForkastDraftButton(): ReactElement {
    const mode = useMode()
    const [draftId] = useDraftId()
    const router = useRouter()
    const dispatch = useAppDispatch()

    const [mutation, deleteResult] = useMutation(DeleteDraftDocument, {
        refetchQueries: [{ query: GetAllDraftsDocument }],
    })

    return (
        <ShortcutButtons
            variant="tertiary"
            onClick={() =>
                spanBrowserAsync('DeleteDraft(forkast).mutation', async () => {
                    const redirect = (): void => {
                        const redirectPath = mode === 'FHIR' ? '/fhir' : '/ny'
                        router.replace(redirectPath, { scroll: true })

                        requestAnimationFrame(() => {
                            dispatch(nySykmeldingActions.reset())
                        })
                    }

                    if (!draftId) {
                        redirect()
                        return
                    }

                    return mutation({
                        variables: { draftId: draftId },
                        onCompleted: redirect,
                        update: (cache, result) => {
                            if (result.data?.deleteDraft == true) {
                                cache.evict({
                                    id: cache.identify({
                                        __typename: 'OpprettSykmeldingDraft',
                                        draftId,
                                    } satisfies CacheIds['draft']),
                                })
                            }
                        },
                    })
                })
            }
            loading={deleteResult.loading}
            shortcut={{
                modifier: 'alt',
                key: 'd',
            }}
        >
            Avbryt og forkast
        </ShortcutButtons>
    )
}

export default ForkastDraftButton
