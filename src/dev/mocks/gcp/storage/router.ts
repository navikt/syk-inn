import { Hono } from 'hono'

import { gcpLogger } from '../logger'

export const storageRouter = new Hono()
    .get('/b/:bucketName/o/:fileId', (c) => {
        assertCorrectBucket(c.req.param('bucketName'))

        console.log('HI!: ', c.req.param('bucketName'), c.req.param('fileId'))

        return c.json({ bad: 'yes' }, 200)
    })
    .get('*', (c) => {
        gcpLogger.info(`GET GCP Storage mock: ${c.req.method} ${c.req.path}`)

        return c.json({ bad: 'yes' }, 500)
    })
    .post('*', (c) => {
        gcpLogger.info(`POST GCP Storage mock: ${c.req.method} ${c.req.path}`)

        return c.json({ bad: 'yes' }, 500)
    })

const EXPECTED_BUCKET_NAME = 'tsm-syk-inn-pdf'

function assertCorrectBucket(name: string): asserts name is typeof EXPECTED_BUCKET_NAME {
    if (name !== EXPECTED_BUCKET_NAME) {
        throw new Error(`Unexpected bucket name: ${name}, should be ${EXPECTED_BUCKET_NAME}`)
    }
}
