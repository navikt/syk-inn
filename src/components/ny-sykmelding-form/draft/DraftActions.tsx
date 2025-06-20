import React, { ReactElement } from 'react'
import { Button } from '@navikt/ds-react'
import { useMutation } from '@apollo/client'
import { useRouter } from 'next/navigation'
import { FloppydiskIcon } from '@navikt/aksel-icons'
import { toast } from 'sonner'

import { DeleteDraftDocument, GetAllDraftsDocument } from '@queries'
import { useDraftId } from '@components/ny-sykmelding-form/draft/useDraftId'
import { useFormContext } from '@components/ny-sykmelding-form/form'
import { useSaveDraft } from '@components/ny-sykmelding-form/draft/useSaveDraft'
import { spanAsync } from '@otel/otel'

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
        <Button
            type="button"
            variant="secondary"
            icon={<FloppydiskIcon aria-hidden />}
            iconPosition="right"
            onClick={async () => {
                const values = getValues()

                await mutation(draftId, values)
            }}
            loading={draftResult.loading}
        >
            Lagre (utkast)
        </Button>
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
        // TODO: Update cache and remove the draftId from the normalized cache
        refetchQueries: [GetAllDraftsDocument],
    })

    return (
        <Button
            type="button"
            variant="tertiary"
            onClick={() => spanAsync('DeleteDraft(forkast).mutation', async () => mutation())}
            loading={deleteResult.loading}
        >
            Avbryt og forkast
        </Button>
    )
}

export default ForkastDraftButton
