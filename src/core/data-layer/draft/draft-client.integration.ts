import { StartedTestContainer } from 'testcontainers'
import { beforeAll, describe, expect, test } from 'vitest'

import { realValkey } from '#core/services/valkey/client'
import { DraftValues } from './draft-schema'
import { initializeValkey } from '#lib/test/valkey'

import { createDraftClient } from './draft-client'

describe('draft client integration', () => {
    let valkey: StartedTestContainer

    beforeAll(async () => {
        valkey = await initializeValkey()

        process.env.VALKEY_HOST_SYK_INN = `${valkey.getHost()}`
        process.env.VALKEY_PORT_SYK_INN = `${valkey.getMappedPort(6379)}`
    })

    test('simple sanity check that inserts a basic draft and fetches it back', async () => {
        const client = createDraftClient(await realValkey())

        await client.saveDraft('test-draft', { hpr: 'test-hpr', ident: 'test-ident' }, emptyDraft)
        const savedDraft = await client.getDraft('test-draft', { hpr: 'test-hpr', ident: 'test-ident' })

        expect(savedDraft).not.toBeNull()
        expect(savedDraft?.draftId).toBe('test-draft')
        expect(savedDraft?.values).toEqual(emptyDraft)
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
    utdypendeSporsmal: null,
    annenFravarsgrunn: null,
}
