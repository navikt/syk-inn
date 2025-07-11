import { describe, it, expect } from 'vitest'

import { createInMemoryValkey } from '../mock-engine/valkey/InMemValkey'

import { createDraftClient } from './draft-client'
import { DraftValues } from './draft-schema'

describe('in memory draft client', () => {
    it('should save a draft', async () => {
        const client = createDraftClient(createInMemoryValkey())

        await client.saveDraft('test-1', { hpr: '999', ident: '111' }, emptyDraft)

        const draft = await client.getDraft('test-1')

        expect(draft).not.toBeNull()
        expect(draft?.draftId).toBe('test-1')
        expect(draft?.lastUpdated).not.toBeNull()
        expect(draft?.values).toEqual(emptyDraft)

        const drafts = await client.getDrafts({ hpr: '999', ident: '111' })
        expect(drafts).toHaveLength(1)
    })

    it('should delete a draft', async () => {
        const ownership = { hpr: '999', ident: '111' }
        const client = createDraftClient(createInMemoryValkey())

        await client.saveDraft('test-1', ownership, emptyDraft)
        const draft = await client.getDraft('test-1')

        expect(draft).not.toBeNull()
        expect(draft?.draftId).toBe('test-1')

        await client.deleteDraft('test-1', ownership)

        const drafts = await client.getDrafts(ownership)
        expect(drafts).toHaveLength(0)
    })

    it('should support multiple drafts', async () => {
        const ownership = { hpr: '999', ident: '111' }
        const client = createDraftClient(createInMemoryValkey())

        await client.saveDraft('test-1', ownership, emptyDraft)
        await client.saveDraft('test-2', ownership, emptyDraft)
        await client.saveDraft('test-3', ownership, emptyDraft)
        await client.saveDraft('test-4', ownership, emptyDraft)

        await client.deleteDraft('test-3', ownership)

        const drafts = await client.getDrafts(ownership)
        expect(drafts).toHaveLength(3)
        expect(drafts.map((d) => d.draftId)).toEqual(['test-1', 'test-2', 'test-4'])
    })
})

const emptyDraft: DraftValues = {
    arbeidsforhold: null,
    perioder: null,
    hoveddiagnose: null,
    bidiagnoser: [],
    svangerskapsrelatert: null,
    tilbakedatering: null,
    meldinger: null,
    yrkesskade: null,
}
