import { useQueryState, parseAsString } from 'nuqs'
import { useParams } from 'next/navigation'

export function useDraftId(): [string | null, (id: string) => Promise<URLSearchParams>] {
    const params = useParams<{ draftId?: string }>()
    const [draftId, setDraftId] = useQueryState(
        'draft',
        parseAsString.withDefault('').withOptions({ clearOnDefault: true, shallow: true, history: 'replace' }),
    )

    // When on a page with /[draftId] params use that, otherwise use the ?draft= query param
    const draftIdToUse = params.draftId || draftId || null

    return [draftIdToUse, setDraftId]
}
