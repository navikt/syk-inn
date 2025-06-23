import React, { ReactElement } from 'react'
import { useMutation } from '@apollo/client'
import { useRouter } from 'next/navigation'
import { FloppydiskIcon } from '@navikt/aksel-icons'
import { toast } from 'sonner'

import { DeleteDraftDocument, GetAllDraftsDocument } from '@queries'
import { useDraftId } from '@components/ny-sykmelding-form/draft/useDraftId'
import { useFormContext } from '@components/ny-sykmelding-form/form'
import { useSaveDraft } from '@components/ny-sykmelding-form/draft/useSaveDraft'
import { spanAsync } from '@otel/otel'
import { ShortcutButton } from '@components/shortcut/ShortcutButton'

import { useMode } from '../../../providers/ModeProvider'
import { useAppDispatch } from '../../../providers/redux/hooks'
import { nySykmeldingMultistepActions } from '../../../providers/redux/reducers/ny-sykmelding-multistep'

export function LagreDraftButton(): ReactElement {
    const draftId = useDraftId()
    const { getValues } = useFormContext()
    const [mutation, draftResult] = useSaveDraft({
        returnToDash: true,
        onCompleted: () => {
            toast('Lagret utkast')

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
                modifier: 'shift',
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
            toast('Slettet utkast')

            const redirectPath = mode === 'FHIR' ? '/fhir' : '/ny'
            router.replace(redirectPath, { scroll: true })

            requestAnimationFrame(() => {
                dispatch(nySykmeldingMultistepActions.reset())
            })
        },
        refetchQueries: [GetAllDraftsDocument],
        update: (cache, result) => {
            if (result.data?.deleteDraft == true) {
                cache.evict({ id: cache.identify({ __typename: 'OpprettSykmeldingDraft', draftId }) })
            }
        },
    })

    return (
        <ShortcutButton
            variant="tertiary"
            onClick={() => spanAsync('DeleteDraft(forkast).mutation', async () => mutation())}
            loading={deleteResult.loading}
            shortcut={{
                modifier: 'shift',
                key: 'd',
            }}
        >
            Avbryt og forkast
        </ShortcutButton>
    )
}

export default ForkastDraftButton
