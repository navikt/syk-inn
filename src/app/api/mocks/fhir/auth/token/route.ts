import { logger as pinoLogger } from '@navikt/next-logger'
import { notFound } from 'next/navigation'

import { getAbsoluteURL } from '@utils/url'
import { isE2E, isLocalOrDemo } from '@utils/env'

import { createAccessToken, createIdToken } from '../../jwt'
import testData from '../../(resources)/data'

const logger = pinoLogger.child({}, { msgPrefix: '[FHIR-MOCK-Auth] ' })

export async function POST(request: Request): Promise<Response> {
    if (!isLocalOrDemo && !isE2E) {
        notFound()
    }

    const body = await request.formData()

    if (body.has('code')) {
        logger.info(`Token exchange, got code`)
    } else {
        logger.error(`Token exchange, missing code`)
        return new Response('Missing code', { status: 400 })
    }

    return Response.json({
        access_token: await createAccessToken(testData.fhirServer.wellKnown.issuer),
        id_token: await createIdToken(),
        token_type: 'Bearer',
        expires_in: 3600,
        scope: 'openid profile launch fhirUser patient/*.* user/*.* offline_access',
        need_patient_banner: true,
        smart_style_url: `${getAbsoluteURL()}/api/fhir/smart-style.json`,
        patient: 'cd09f5d4-55f7-4a24-a25d-a5b65c7a8805',
        encounter: '320fd29a-31b9-4c9f-963c-c6c88332d89a',
    })
}
