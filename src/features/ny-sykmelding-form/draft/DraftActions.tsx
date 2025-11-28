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

export function LagreDraftButton({ className }: { className?: string }): ReactElement {
    const mode = useMode()
    const router = useRouter()
    const draft = useFormDraftSync()

    return (
        <ShortcutButtons
            className={className}
            variant="secondary"
            icon={<FloppydiskIcon aria-hidden />}
            iconPosition="right"
            onClick={async () => {
                await draft.saveDraft()

                router.replace(mode.paths.root)
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

export function ForkastDraftButtonInFormSync({ className }: { className?: string }): ReactElement {
    const draft = useFormDraftSync()

    return <ForkastDraftButton className={className} onForkast={draft.cancelSync} />
}

export function ForkastDraftButton({
    inactive,
    onForkast,
    className,
}: {
    onForkast?: () => void
    inactive?: boolean
    className?: string
}): ReactElement {
    const mode = useMode()
    const [draftId] = useDraftId()
    const router = useRouter()

    const [mutation, deleteResult] = useMutation(DeleteDraftDocument, {
        refetchQueries: [{ query: GetAllDraftsDocument }],
    })

    return (
        <ShortcutButtons
            className={className}
            variant="tertiary"
            onClick={() =>
                spanBrowserAsync('DeleteDraft(forkast).mutation', async () => {
                    const redirect = (): void => {
                        router.replace(mode.paths.root, { scroll: true })
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
