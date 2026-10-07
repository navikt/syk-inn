import { CRC32C } from '@google-cloud/storage'
import { Hono } from 'hono'

import { raise } from '#lib/ts'

import { gcpLogger } from '../logger'

import { fakeFileBucket } from './file-bucket'
import { assertCorrectBucket, objectAlreadyExistsError, objectNotFoundError } from './gcp-utils'
import { extractMultipartRelatedFile } from './multipart-utils'

export const storageRouter = new Hono()
    .get('/b/:bucketName/o/:fileId', async (c) => {
        assertCorrectBucket(c.req.param('bucketName'))

        const id = c.req.param('fileId')
        let pdfBytes: Buffer
        try {
            pdfBytes = await fakeFileBucket.readFile(id)
        } catch (error) {
            if (error instanceof Error && 'code' in error && error.code === 'ENOENT') {
                return c.json(objectNotFoundError, 404)
            }
            throw error
        }

        const checksum = new CRC32C()
        checksum.update(pdfBytes)

        if (c.req.query('alt') === 'media') {
            return c.body(new Uint8Array(pdfBytes), 200, {
                'Content-Type': 'application/pdf',
                'Content-Length': String(pdfBytes.length),
                'Cache-Control': 'private, no-store',
                'x-goog-hash': `crc32c=${checksum.toString()}`,
            })
        }

        return c.json({
            kind: 'storage#object',
            bucket: c.req.param('bucketName'),
            name: id,
            contentType: 'application/pdf',
            size: String(pdfBytes.length),
            crc32c: checksum.toString(),
        })
    })
    .post('/upload/storage/v1/b/:bucketName/o', async (c) => {
        assertCorrectBucket(c.req.param('bucketName'))

        const id = c.req.query('name') ?? raise(new Error('Missing name query parameter'))
        const pdfBytes = await extractMultipartRelatedFile(c.req.raw)

        try {
            await fakeFileBucket.writeFile(id, pdfBytes, c.req.query('ifGenerationMatch') === '0')
        } catch (error) {
            if (error instanceof Error && 'code' in error && error.code === 'EEXIST') {
                return c.json(objectAlreadyExistsError, 412)
            }
            throw error
        }

        const checksum = new CRC32C()
        checksum.update(pdfBytes)

        return c.json({
            kind: 'storage#object',
            bucket: c.req.param('bucketName'),
            name: id,
            contentType: 'application/pdf',
            size: String(pdfBytes.length),
            generation: String(Date.now()),
            metageneration: '1',
            crc32c: checksum.toString(),
        })
    })
    .notFound((c) => {
        gcpLogger.warn(
            `Library tried to fetch ${c.req.method} ${c.req.path} from GCP Storage mock, but this is not mocked`,
        )

        return c.json({ message: 'Unsupported GCP mock operation' }, 500)
    })
