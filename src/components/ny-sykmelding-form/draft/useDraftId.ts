import { useParams } from 'next/navigation'

export function useDraftId(): string {
    const params = useParams<{ draftId?: string }>()

    if (!params.draftId) {
        throw new Error(
            'Draft ID is required but not provided in the URL parameters. Is your route configured with [draftId] route param?',
        )
    }

    return params.draftId
}
