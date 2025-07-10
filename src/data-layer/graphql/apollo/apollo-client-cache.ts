import { InMemoryCache } from '@apollo/client-integration-nextjs'
import { Reference } from '@apollo/client'

import possibleTypesGenerated from '@graphql/possible-types.generated'

/**
 * Values that are normalized, needs to be kept in sync with this type.
 *
 * This is used for cache.modify updates.
 */
export type RootQueryType = {
    drafts: Reference[]
    sykmeldinger: Reference[]
}

export type CacheIds = {
    draft: { __typename: 'OpprettSykmeldingDraft'; draftId: string }
    sykmelding: { __typename: 'Sykmelding'; sykmeldingId: string }
}

export function createInMemoryCache(): InMemoryCache {
    return new InMemoryCache({
        typePolicies: {
            OpprettSykmeldingDraft: {
                keyFields: ['draftId'],
            },
            Sykmelding: {
                keyFields: ['sykmeldingId'],
            },
        },
        possibleTypes: possibleTypesGenerated.possibleTypes,
    })
}
