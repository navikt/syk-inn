import { Bucket, Storage, FileMetadata } from '@google-cloud/storage'
import { parseISO } from 'date-fns'
import { nextleton } from 'nextleton'
import { Readable } from 'node:stream'

const BUCKET_NAME = 'tsm-syk-inn-pdf'

const bucket: Bucket = nextleton('google-storage', () => {
    return new Storage().bucket(BUCKET_NAME)
})

export const gcpBucketClient = {
    async savePdfToBucket(sykmeldingId: string, pdf: ArrayBuffer, latestTom: string): Promise<void> {
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
    },
    async pdfAlreadyExists(sykmeldingId: string): Promise<boolean> {
        const [exists] = await bucket.file(sykmeldingId).exists()

        return exists
    },
    async pdfMetadata(sykmeldingId: string): Promise<FileMetadata> {
        const [metadata] = await bucket.file(sykmeldingId).getMetadata()

        return metadata
    },
    /**
     * Assumes the file already exists, check with `pdfAlreadyExists` before calling this method to avoid errors.
     */
    async getPdfFromBucket(sykmeldingId: string): Promise<Uint8Array> {
        const [file] = await bucket.file(sykmeldingId).download()

        return new Uint8Array(file)
    },
    /**
     * Assumes the file already exists, check with `pdfAlreadyExists` before calling this method to avoid errors.
     */
    streamPdfFromBucket(sykmeldingId: string): Readable {
        return bucket.file(sykmeldingId).createReadStream()
    },
}

/*
gcpBucketClient
    .savePdfToBucket('test-sykmelding-id', new Uint8Array([1, 2, 3]), '2024-06-01T00:00:00Z')
    .then(async () => {
        console.log('PDF saved successfully')

        console.log(`PDF already exists: ${await gcpBucketClient.pdfAlreadyExists('test-sykmelding-id')}`)
    })
*/
