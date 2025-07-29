import { ApolloCache } from '@apollo/client'

import { CacheIds, RootQueryType } from './apollo-client-cache'

export function deleteDraftIdFromList(cache: ApolloCache<unknown>, draftId: string): void {
    cache.modify<RootQueryType>({
        id: 'ROOT_QUERY',
        fields: {
            drafts: (existingDraftRefs, { readField }) =>
                existingDraftRefs.filter((ref) => readField('draftId', ref) !== draftId),
        },
    })

    cache.evict({
        id: cache.identify({
            __typename: 'OpprettSykmeldingDraft',
            draftId,
        } satisfies CacheIds['draft']),
    })
}
