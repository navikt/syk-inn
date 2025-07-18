import React, { ReactElement } from 'react'
import { useMutation } from '@apollo/client'
import { useRouter } from 'next/navigation'
import { FloppydiskIcon } from '@navikt/aksel-icons'

import { DeleteDraftDocument, GetAllDraftsDocument, OpprettSykmeldingDraft } from '@queries'
import { useDraftId } from '@components/ny-sykmelding-form/draft/useDraftId'
import { useFormContext } from '@components/ny-sykmelding-form/form'
import { useSaveDraft } from '@components/ny-sykmelding-form/draft/useSaveDraft'
import { ShortcutButton } from '@components/shortcut/ShortcutButton'
import { spanBrowserAsync } from '@otel/browser'

import { useMode } from '../../../providers/ModeProvider'
import { useAppDispatch } from '../../../providers/redux/hooks'
import { nySykmeldingMultistepActions } from '../../../providers/redux/reducers/ny-sykmelding-multistep'

export function LagreDraftButton(): ReactElement {
    const draftId = useDraftId()
    const { getValues } = useFormContext()
    const [mutation, draftResult] = useSaveDraft({
        returnToDash: true,
        onCompleted: () => {
            dispatch(nySykmeldingMultistepActions.reset())
        },
    })
    const dispatch = useAppDispatch()

    return (
        <ShortcutButton
            variant="secondary"
            icon={<FloppydiskIcon aria-hidden />}
            iconPosition="right"
            onClick={async () => {
                const values = getValues()

                await mutation(draftId, values)
            }}
            loading={draftResult.loading}
            shortcut={{
                modifier: 'alt',
                key: 's',
            }}
        >
            Lagre (utkast)
        </ShortcutButton>
    )
}

function ForkastDraftButton(): ReactElement {
    const mode = useMode()
    const draftId = useDraftId()
    const router = useRouter()
    const dispatch = useAppDispatch()

    const [mutation, deleteResult] = useMutation(DeleteDraftDocument, {
        variables: { draftId },
        onCompleted: () => {
            const redirectPath = mode === 'FHIR' ? '/fhir' : '/ny'
            router.replace(redirectPath, { scroll: true })

            requestAnimationFrame(() => {
                dispatch(nySykmeldingMultistepActions.reset())
            })
        },
        refetchQueries: [{ query: GetAllDraftsDocument }],
        update: (cache, result) => {
            if (result.data?.deleteDraft == true) {
                cache.evict({
                    id: cache.identify({
                        __typename: 'OpprettSykmeldingDraft',
                        draftId,
                    } satisfies Partial<OpprettSykmeldingDraft>),
                })
            }
        },
    })

    return (
        <ShortcutButton
            variant="tertiary"
            onClick={() => spanBrowserAsync('DeleteDraft(forkast).mutation', async () => mutation())}
            loading={deleteResult.loading}
            shortcut={{
                modifier: 'alt',
                key: 'd',
            }}
        >
            Avbryt og forkast
        </ShortcutButton>
    )
}

export default ForkastDraftButton
