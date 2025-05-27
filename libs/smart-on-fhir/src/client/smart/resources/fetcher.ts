import { CompleteSession } from '../../storage/schema'
import { logger } from '../../logger'

type FhirPath = {
    session: CompleteSession
    path: `/${string}`
}

type PostFhir = {
    payload: unknown
}

export async function postFhir({ session, path }: FhirPath, { payload }: PostFhir): Promise<Response> {
    const resourcePath = `${session.server}${path}`

    // TODO: remove
    logger.info(JSON.stringify(payload))

    return await fetch(resourcePath, {
        method: 'POST',
        body: JSON.stringify(payload),
        headers: {
            Authorization: `Bearer ${session.accessToken}`,
            Accept: 'application/json',
            ContentType: 'application/json',
        },
    })
}

export async function getFhir({ session, path }: FhirPath): Promise<Response> {
    const resourcePath = `${session.server}${path}`
    return await fetch(resourcePath, {
        method: 'GET',
        headers: {
            Authorization: `Bearer ${session.accessToken}`,
            Accept: 'application/fhir+json,application/json',
        },
    })
}
