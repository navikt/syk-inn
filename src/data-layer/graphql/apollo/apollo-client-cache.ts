import { InMemoryCache } from '@apollo/client-integration-nextjs'
import { Reference } from '@apollo/client'
import { FieldReadFunction } from '@apollo/client/cache/inmemory/policies'

import possibleTypesGenerated from '@graphql/possible-types.generated'
import { Query } from '@queries'

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
    draft: Pick<NonNullable<Query['draft']>, '__typename' | 'draftId'>
    sykmelding: Pick<NonNullable<Query['sykmelding']>, '__typename' | 'sykmeldingId'>
}

export type QueryFieldPolicies = Record<keyof Query, FieldReadFunction<unknown> | undefined>

/**
 * These type policies are used to point queries such as `sykmelding(id: "123")` to the correct cache
 * in the normalized cache. For example if a list of sykmeldinger are fetched, all the entities will be
 * normalized and stored in the cache with their `sykmeldingId`, for
 * example: Sykmelding:{"sykmeldingId":"1dd90054-b75e-4e7f-a5ef-31121f0c6bdb"}.
 *
 * When a query is made for `sykmelding(id: "1dd90054-b75e-4e7f-a5ef-31121f0c6bdb")`, this type policy
 * will create a reference to the normalized cache entry, allowing apollo to not have to fetch the sykmelding
 * from the server, but instead just refer to the normalized cache entry.
 *
 * DANGER! These are weakly typed, and needs to be modified very carefully. I have attempted to type them kinda,
 * but "args.id" refer to the ID used in any query, and might differ. And the __typenames are based on the GQL schema.
 */
const QueryTypePolicies = {
    fields: {
        sykmelding: (_, { args, toReference }) => {
            if (!args?.id) return
            return toReference({
                __typename: 'Sykmelding',
                sykmeldingId: args.id,
            } satisfies CacheIds['sykmelding'])
        },
        draft: (_, { args, toReference }) => {
            if (!args?.draftId) return
            return toReference({
                __typename: 'OpprettSykmeldingDraft',
                draftId: args?.draftId,
            } satisfies CacheIds['draft'])
        },
    } satisfies Partial<QueryFieldPolicies>,
}

export function createInMemoryCache(): InMemoryCache {
    return new InMemoryCache({
        typePolicies: {
            Query: QueryTypePolicies,
            OpprettSykmeldingDraft: {
                keyFields: ['draftId'] satisfies (keyof CacheIds['draft'])[],
            },
            Sykmelding: {
                keyFields: ['sykmeldingId'] satisfies (keyof CacheIds['sykmelding'])[],
            },
        },
        possibleTypes: possibleTypesGenerated.possibleTypes,
    })
}
