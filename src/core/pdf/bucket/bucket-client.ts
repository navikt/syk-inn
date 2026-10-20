import { Bucket, Storage, FileMetadata } from '@google-cloud/storage'
import { parseISO } from 'date-fns'
import { nextleton } from 'nextleton'

import { bundledEnv } from '#lib/env'
import { spanServerAsync, squelchTracing } from '#lib/otel/server'

const BUCKET_NAME = `tsm-syk-inn-pdf-${bundledEnv.runtimeEnv === 'prod-gcp' ? 'prod' : 'dev'}`

const bucket: Bucket = nextleton('google-storage', () => {
    return new Storage().bucket(BUCKET_NAME)
})

export const gcpBucketClient = {
    async savePdfToBucket(sykmeldingId: string, pdf: ArrayBuffer, latestTom: string): Promise<void> {
        return spanServerAsync('gcpBucketClient.savePdfToBucket', async () => {
            const uint8ArrayPdf = new Uint8Array(pdf)
            await bucket.file(sykmeldingId).save(uint8ArrayPdf, {
                contentType: 'application/pdf',
                resumable: false,
                metadata: {
                    contentType: 'application/pdf',
                    customTime: parseISO(latestTom).toISOString(),
                    cacheControl: 'private, no-store',
                },
                preconditionOpts: { ifGenerationMatch: 0 },
            })
        })
    },
    async pdfAlreadyExists(sykmeldingId: string): Promise<boolean> {
        return spanServerAsync('gcpBucketClient.pdfAlreadyExists', async (span) => {
            /**
             *  Why squelch: When the file does not exist, the underlying 404 request is automatically marked as
             * 'error' in OTEL. This causes the overall trace to be an error-trace, which we do not want.
             */
            const [exists] = await squelchTracing(() => bucket.file(sykmeldingId).exists())

            span.setAttribute('gcpBucketClient.pdfAlreadyExists.exists', exists)

            return exists
        })
    },
    async pdfMetadata(sykmeldingId: string): Promise<FileMetadata> {
        return spanServerAsync('gcpBucketClient.pdfMetadata', async () => {
            const [metadata] = await bucket.file(sykmeldingId).getMetadata()

            return metadata
        })
    },
    /**
     * Assumes the file already exists, check with `pdfAlreadyExists` before calling this method to avoid errors.
     */
    async getPdfFromBucket(sykmeldingId: string): Promise<Uint8Array> {
        return spanServerAsync('gcpBucketClient.getPdfFromBucket', async () => {
            const [file] = await bucket.file(sykmeldingId).download()

            return new Uint8Array(file)
        })
    },
}
