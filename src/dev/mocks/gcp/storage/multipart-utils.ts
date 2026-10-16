import { HTTPException } from 'hono/http-exception'

/**
 * Hono doesn't support multipart/related parsing out of the box, which is what Google Storage API
 * uses. These are some vibe coded complexities for the mock server to extract the PDF bytes.
 */
export async function extractMultipartRelatedFile(request: Request): Promise<Buffer> {
    const contentType = request.headers.get('Content-Type') ?? ''
    const boundary = /boundary=(?:"([^"]+)"|([^;\s]+))/i.exec(contentType)
    const boundaryValue = boundary?.[1] ?? boundary?.[2]
    if (!/^multipart\/related\s*;/i.test(contentType) || !boundaryValue) {
        throw invalidMultipart('Expected multipart/related with a boundary')
    }

    // GCS sends JSON metadata first, followed by the file. Keep the body binary.
    const body = Buffer.from(await request.arrayBuffer())
    const partBoundary = Buffer.from(`\r\n--${boundaryValue}\r\n`)
    const mediaPartStart = body.indexOf(partBoundary)
    if (mediaPartStart === -1) {
        throw invalidMultipart('Missing file part')
    }

    const headersEnd = body.indexOf('\r\n\r\n', mediaPartStart + partBoundary.length)
    if (headersEnd === -1) {
        throw invalidMultipart('Missing file part headers')
    }

    const fileStart = headersEnd + 4
    const fileEnd = body.indexOf(Buffer.from(`\r\n--${boundaryValue}--`), fileStart)
    if (fileEnd === -1) {
        throw invalidMultipart('Missing closing multipart boundary')
    }

    return body.subarray(fileStart, fileEnd)
}

function invalidMultipart(message: string): HTTPException {
    return new HTTPException(400, { message, res: Response.json({ error: message }, { status: 400 }) })
}
