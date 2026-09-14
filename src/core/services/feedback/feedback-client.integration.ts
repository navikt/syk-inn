import { Feedback } from '@navikt/syk-zara/feedback'
import { AdminFeedbackClient, createAdminFeedbackClient } from '@navikt/syk-zara/feedback/admin'
import { StartedTestContainer } from 'testcontainers'
import { beforeAll, describe, expect, test } from 'vitest'

import { initializeValkey } from '#lib/test/valkey'

import { realValkey } from '../valkey/client'

import { getFeedbackClient } from './feedback-client'

describe('feedback client integration test', () => {
    let valkey: StartedTestContainer

    beforeAll(async () => {
        valkey = await initializeValkey()

        process.env.VALKEY_HOST_SYK_INN = `${valkey.getHost()}`
        process.env.VALKEY_PORT_SYK_INN = `${valkey.getMappedPort(6379)}`
    })

    test('submitting feedback to valkey should be good in the hood', async () => {
        const feedback = await getFeedbackClient()

        await feedback.create('foo-bar-baz', {
            type: 'FULL',
            message: 'Dette er en test',
            user: {
                name: 'Testbruker',
                hpr: '123456789',
            },
            sentiment: 4,
            category: 'FEIL',
            contact: {
                type: 'EMAIL',
                details: 'test@example.com',
            },
            meta: {
                system: 'test-system',
                location: 'test-location',
                tags: ['test', 'feedback'],
                dev: {
                    version: '1.0.0',
                    env: 'test',
                },
            },
        })

        const admin = await adminClient()
        const item = await admin.byId('foo-bar-baz')

        expect(item).toEqual({
            id: 'foo-bar-baz',
            type: 'CONTACTABLE',
            timestamp: expect.any(String),
            message: 'Dette er en test',
            name: 'Testbruker',
            uid: '123456789',
            sentiment: 4,
            category: 'FEIL',
            contactType: 'EMAIL',
            contactDetails: 'test@example.com',
            verifiedContentAt: null,
            verifiedContentBy: null,
            contactedAt: null,
            contactedBy: null,
            sharedAt: null,
            sharedBy: null,
            sharedLink: null,
            redactionLog: [],
            metaLocation: 'test-location',
            metaSystem: 'test-system',
            metaSource: 'syk-inn',
            metaTags: ['test', 'feedback'],
            metaDev: {
                version: '1.0.0',
                env: 'test',
            },
        } satisfies Feedback)
    })

    test('submitting without sentiment and adding it later should be good', async () => {
        const feedback = await getFeedbackClient()

        await feedback.create('foo-bar-twoz', {
            type: 'FULL',
            message: 'Dette er en test',
            user: {
                name: 'Testbruker',
                hpr: '123456789',
            },
            sentiment: null,
            category: 'FEIL',
            contact: {
                type: 'EMAIL',
                details: 'test@example.com',
            },
            meta: {
                system: 'test-system',
                location: 'test-location',
                tags: ['test', 'feedback'],
                dev: {
                    version: '1.0.0',
                    env: 'test',
                },
            },
        })

        const admin = await adminClient()
        const item = await admin.byId('foo-bar-twoz')
        expect(item?.sentiment).toBeNull()

        await feedback.sentiment('foo-bar-twoz', 5)

        const updatedItem = await admin.byId('foo-bar-twoz')
        expect(updatedItem?.sentiment).toEqual(5)
    })
})

async function adminClient(): Promise<AdminFeedbackClient> {
    return createAdminFeedbackClient(await realValkey())
}
