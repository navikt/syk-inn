import fs from 'node:fs/promises'
import path from 'node:path'

const FAKE_BUCKET_FOLDER = path.resolve(process.cwd(), 'fake-bucket-pdfs')

export const fakeFileBucket = {
    async writeFile(fileId: string, data: Buffer, createOnly = false): Promise<void> {
        const filePath = getFilePath(`${fileId}.pdf`)
        await fs.mkdir(FAKE_BUCKET_FOLDER, { recursive: true })
        await fs.writeFile(filePath, data, { flag: createOnly ? 'wx' : 'w' })
    },
    async readFile(fileId: string): Promise<Buffer> {
        return fs.readFile(getFilePath(`${fileId}.pdf`))
    },
    async fileExists(fileId: string): Promise<boolean> {
        try {
            await fs.access(getFilePath(`${fileId}.pdf`))
            return true
        } catch (error) {
            if (error instanceof Error && 'code' in error && error.code === 'ENOENT') {
                return false
            }
            throw error
        }
    },
}

function getFilePath(fileId: string): string {
    if (!fileId || fileId === '.' || fileId === '..' || /[/\\\0]/.test(fileId)) {
        throw new Error(`Invalid file ID: ${fileId}`)
    }

    return path.join(FAKE_BUCKET_FOLDER, fileId)
}
