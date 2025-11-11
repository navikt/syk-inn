import { describe, test, expect } from 'vitest'
import { ApolloClient, InMemoryCache } from '@apollo/client'
import { MockLink } from '@apollo/client/testing'
import { execute, ExecutionResult } from 'graphql/execution'
import { addTypenameToDocument } from '@apollo/client/utilities'

import { createInMemoryCache } from '@data-layer/graphql/apollo/apollo-client-cache'
import {
    AllSykmeldingerDocument,
    AllSykmeldingerQuery,
    DraftFragment,
    GetAllDraftsDocument,
    GetDraftDocument,
    GetDraftQuery,
    SykmeldingByIdDocument,
    SykmeldingByIdQuery,
} from '@queries'
import {
    sykInnApiSykmeldingRedactedToResolverSykmelding,
    sykInnApiSykmeldingToResolverSykmelding,
} from '@core/services/syk-inn-api/syk-inn-api-utils'
import { createSchema } from '@data-layer/graphql/create-schema'
import { typeResolvers } from '@data-layer/graphql/common-resolvers'
import { SykmeldingBuilder } from '@dev/mock-engine/scenarios/SykInnApiSykmeldingBuilder'

describe('apollo cache normalization - draft', () => {
    const drafts: DraftFragment[] = [
        {
            __typename: 'OpprettSykmeldingDraft',
            draftId: 'draft-1',
            values: { foo: 'bar' },
            lastUpdated: '2023-10-01T00:00:00Z',
        },
        {
            __typename: 'OpprettSykmeldingDraft',
            draftId: 'draft-2',
            values: { foo: 'baz' },
            lastUpdated: '2023-10-02T00:00:00Z',
        },
    ]

    test('draft: hits cache redirect when drafts list is already fetched', async () => {
        const [client, cache] = createTestApollo()

        cache.writeQuery({
            query: GetAllDraftsDocument,
            data: { __typename: 'Query', drafts },
        })

        const { data } = await client.query<GetDraftQuery>({
            query: GetDraftDocument,
            variables: { draftId: 'draft-1' },
        })

        expect(data!.draft).toEqual(drafts[0])
    })

    test('draft: cache redirect shall do a network request when item is not in cache', async () => {
        const [client, cache] = createTestApollo(true)

        cache.writeQuery({
            query: GetAllDraftsDocument,
            data: { __typename: 'Query', drafts },
        })

        await expect(
            client.query<GetDraftQuery>({
                query: GetDraftDocument,
                variables: { draftId: 'draft-no-existy' },
            }),
        ).rejects.toThrow()
    })
})

describe('apollo cache normalization - sykmelding', async () => {
    /**
     * This seems crazy, but this lets us re-use the data-builder from the mock-engine, the mapper
     * from the resolvers, and applies __typenames the same way an apollo-client/sever combo would.
     */
    const executionResult: ExecutionResult<Omit<AllSykmeldingerQuery, '__typename'>, unknown> = await execute({
        schema: createSchema({
            Query: {
                sykmeldinger: () => ({
                    current: [
                        new SykmeldingBuilder({ offset: 0 }, 'sykme-1').enkelAktivitet({ offset: 0, days: 7 }).build(),
                        new SykmeldingBuilder({ offset: 7 }, 'sykme-2')
                            .enkelAktivitet({ offset: 8, days: 7 })
                            .buildRedacted(),
                    ].map((it) =>
                        it.kind === 'full'
                            ? sykInnApiSykmeldingToResolverSykmelding(it)
                            : sykInnApiSykmeldingRedactedToResolverSykmelding(it),
                    ),
                    historical: [],
                }),
            },
            ...typeResolvers,
        }),
        document: addTypenameToDocument(AllSykmeldingerDocument),
    })
    const sykmeldinger = executionResult.data!.sykmeldinger!

    test('sykmelding: hits cache redirect when sykmelding list is already fetched', async () => {
        const [client, cache] = createTestApollo()

        cache.writeQuery({
            query: AllSykmeldingerDocument,
            data: { __typename: 'Query', sykmeldinger: sykmeldinger },
        })

        const { data } = await client.query<SykmeldingByIdQuery>({
            query: SykmeldingByIdDocument,
            variables: { id: 'sykme-1' },
        })

        expect(data!.sykmelding).toEqual(sykmeldinger.current[0])
    })

    test('sykmelding: hits cache redirect when sykmelding list is already fetched for "Redacted" sykmelding', async () => {
        const [client, cache] = createTestApollo()

        cache.writeQuery({
            query: AllSykmeldingerDocument,
            data: { __typename: 'Query', sykmeldinger: sykmeldinger },
        })

        const { data } = await client.query<SykmeldingByIdQuery>({
            query: SykmeldingByIdDocument,
            variables: { id: 'sykme-2' },
        })

        expect(data!.sykmelding).toEqual(sykmeldinger.current[1])
    })

    test('sykmelding: cache redirect shall do a network request when item is not in cache', async () => {
        const [client, cache] = createTestApollo(true)

        cache.writeQuery({
            query: AllSykmeldingerDocument,
            data: { __typename: 'Query', sykmeldinger: sykmeldinger },
        })

        await expect(
            client.query<SykmeldingByIdQuery>({
                query: SykmeldingByIdDocument,
                variables: { id: 'sykme-3' },
            }),
        ).rejects.toThrow()
    })
})

function createTestApollo(expectMockSpam: boolean = false): [ApolloClient, InMemoryCache] {
    const cache = createInMemoryCache()
    const throwingLink = new MockLink([], { showWarnings: !expectMockSpam })
    const client = new ApolloClient({
        cache,
        link: throwingLink,
    })

    return [client, cache] as const
}
