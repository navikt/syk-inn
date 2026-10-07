import fs from 'node:fs/promises'

const FAKE_BUCKET_FOLDER = './fake-bucket-pdfs'

export const fakeFileBucket = {
    async writeFile(fileId: string, data: Buffer): Promise<void> {
        await fs.writeFile(`${FAKE_BUCKET_FOLDER}/${fileId}`, data)
    },
}
