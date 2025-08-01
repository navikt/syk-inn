import React, { ReactElement } from 'react'
import { useMutation } from '@apollo/client'
import { useRouter } from 'next/navigation'
import { FloppydiskIcon } from '@navikt/aksel-icons'

import { DeleteDraftDocument, GetAllDraftsDocument, OpprettSykmeldingDraft } from '@queries'
import { ShortcutButtons } from '@components/shortcut/ShortcutButtons'
import { spanBrowserAsync } from '@core/otel/browser'
import { useAppDispatch } from '@core/redux/hooks'
import { nySykmeldingActions } from '@core/redux/reducers/ny-sykmelding'
import { useMode } from '@core/providers/Modes'

import { useFormContext } from '../form'

import { useSaveDraft } from './useSaveDraft'
import { useDraftId } from './useDraftId'

export function LagreDraftButton(): ReactElement {
    const draftId = useDraftId()
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
        </ShortcutButtons>
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
                dispatch(nySykmeldingActions.reset())
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
        <ShortcutButtons
            variant="tertiary"
            onClick={() => spanBrowserAsync('DeleteDraft(forkast).mutation', async () => mutation())}
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
