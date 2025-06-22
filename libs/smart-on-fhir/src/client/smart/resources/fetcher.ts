import { CompleteSession } from '../../storage/schema'

import { KnownPaths } from './resource-map'
import { KnownCreatePaths } from './create-resource-map'

type FhirSession = {
    session: CompleteSession
}

type PostFhir = {
    payload: unknown
}

export async function postFhir(
    {
        session,
        path,
    }: FhirSession & {
        path: KnownCreatePaths
    },
    { payload }: PostFhir,
): Promise<Response> {
    const resourcePath = `${session.server}/${path}`

    return await fetch(resourcePath, {
        method: 'POST',
        body: JSON.stringify(payload),
        headers: {
            Authorization: `Bearer ${session.accessToken}`,
            Accept: 'application/json',
            'Content-Type': 'application/json',
        },
    })
}

export async function getFhir({
    session,
    path,
}: FhirSession & {
    path: KnownPaths
}): Promise<Response> {
    const resourcePath = `${session.server}/${path}`

    return await fetch(resourcePath, {
        method: 'GET',
        headers: {
            Authorization: `Bearer ${session.accessToken}`,
            Accept: 'application/fhir+json,application/json',
        },
    })
}
