import React, { ReactElement } from 'react'
import { useMutation } from '@apollo/client/react'
import { useRouter } from 'next/navigation'
import { FloppydiskIcon } from '@navikt/aksel-icons'

import { CacheIds } from '@data-layer/graphql/apollo/apollo-client-cache'
import { DeleteDraftDocument, GetAllDraftsDocument } from '@queries'
import { ShortcutButtons } from '@components/shortcut/ShortcutButtons'
import { spanBrowserAsync } from '@lib/otel/browser'
import { useMode } from '@core/providers/Modes'
import { useFormDraftSync } from '@features/ny-sykmelding-form/draft/FormDraftSync'

import { useDraftId } from './useDraftId'

export function LagreDraftButton(): ReactElement {
    const mode = useMode()
    const router = useRouter()
    const draft = useFormDraftSync()

    return (
        <ShortcutButtons
            variant="secondary"
            icon={<FloppydiskIcon aria-hidden />}
            iconPosition="right"
            onClick={async () => {
                await draft.saveDraft()

                const redirectPath = mode === 'FHIR' ? '/fhir' : '/'
                router.replace(redirectPath)
            }}
            loading={draft.result.loading}
            shortcut={{
                modifier: 'alt',
                key: 's',
            }}
        >
            Lagre (utkast)
        </ShortcutButtons>
    )
}

export function ForkastDraftButtonInFormSync(): ReactElement {
    const draft = useFormDraftSync()

    return <ForkastDraftButton onForkast={draft.cancelSync} />
}

export function ForkastDraftButton({
    inactive,
    onForkast,
}: {
    onForkast?: () => void
    inactive?: boolean
}): ReactElement {
    const mode = useMode()
    const [draftId] = useDraftId()
    const router = useRouter()

    const [mutation, deleteResult] = useMutation(DeleteDraftDocument, {
        refetchQueries: [{ query: GetAllDraftsDocument }],
    })

    return (
        <ShortcutButtons
            variant="tertiary"
            onClick={() =>
                spanBrowserAsync('DeleteDraft(forkast).mutation', async () => {
                    const redirect = (): void => {
                        const redirectPath = mode === 'FHIR' ? '/fhir' : '/'
                        router.replace(redirectPath, { scroll: true })
                    }

                    onForkast?.()

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
            inactive={inactive}
        >
            Avbryt og forkast
        </ShortcutButtons>
    )
}
