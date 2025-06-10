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

import { useMode } from '../../../providers/ModeProvider'

export function LagreDraftButton(): ReactElement {
    const draftId = useDraftId()
    const { getValues } = useFormContext()
    const [mutation, draftResult] = useSaveDraft({
        returnToDash: true,
        onCompleted: () => toast('Lagret utkast'),
    })

    return (
        <Button
            type="button"
            variant="secondary"
            icon={<FloppydiskIcon aria-hidden />}
            iconPosition="right"
            onClick={() => {
                const values = getValues()

                mutation(draftId, values)
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

    const [mutation, deleteResult] = useMutation(DeleteDraftDocument, {
        variables: { draftId },
        onCompleted: () => {
            toast('Slettet utkast')

            const redirectPath = mode === 'FHIR' ? '/fhir' : '/ny'
            router.replace(redirectPath)
        },
        // TODO: Update cache and remove the draftId from the normalized cache
        refetchQueries: [GetAllDraftsDocument],
    })

    return (
        <Button type="button" variant="tertiary" onClick={() => mutation()} loading={deleteResult.loading}>
            Avbryt og forkast
        </Button>
    )
}

export default ForkastDraftButton
