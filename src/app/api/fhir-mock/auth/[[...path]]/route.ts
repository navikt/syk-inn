import { logger as pinoLogger } from '@navikt/next-logger/dist/logger'

const logger = pinoLogger.child({}, { msgPrefix: '[FHIR-MOCK-Auth] ' })

async function handler(req: Request): Promise<Response> {
    const url = new URL(req.url)
    const fhirPath = cleanPath(url.pathname)

    logger.info(`Incoming request: ${req.method} - ${fhirPath}`)

    return new Response(`Auth mock not implemented for ${req.method} - ${fhirPath}`, { status: 501 })
}

function cleanPath(url: string): string {
    return url.replace(/.*\/fhir-mock\/auth/, '')
}

export {
    handler as GET,
    handler as POST,
    handler as PUT,
    handler as DELETE,
    handler as PATCH,
    handler as OPTIONS,
    handler as HEAD,
}
