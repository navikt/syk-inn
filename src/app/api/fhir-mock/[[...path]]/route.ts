import { createChildLogger } from '@navikt/next-logger'

const logger = createChildLogger('fhir-mock')

async function handler(req: Request): Promise<Response> {
    logger.info(`${req.method} - path: ${new URL(req.url).pathname}`)

    // TODO: Implement FHIR Mock
    return Response.json({ ok: '2k' })
}

export {
    handler as GET,
    handler as POST,
    handler as PUT,
    handler as DELETE,
    handler as PATCH,
    handler as OPTIONS,
    handler as HEAD,
    handler as CONNECT,
    handler as TRACE,
}
