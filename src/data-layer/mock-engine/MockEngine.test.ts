import { expect, test } from 'vitest'

import { MockEngine } from './MockEngine'
import { scenarios } from './scenarios/scenarios'

const testOwner = { hpr: '9144889', ident: '21037712323' }

/**
 * Sanity check to ensure that draft client is initialized properly
 */
test('should be able to delete drafts from initial state', async () => {
    const mock = new MockEngine(scenarios['plenty-of-drafts'].scenario())
    await mock.init()

    const drafts = await mock.draftClient.getDrafts(testOwner)
    expect(drafts).toHaveLength(15)

    await mock.draftClient.deleteDraft(drafts[0].draftId, testOwner)

    expect(await mock.draftClient.getDrafts(testOwner)).toHaveLength(14)
    await mock.init()
    expect(await mock.draftClient.getDrafts(testOwner)).toHaveLength(14)
})
