import { getServerEnv } from '#lib/env'

let publicJwk: unknown = null

export function GET(): Response {
    publicJwk ??= JSON.parse(getServerEnv().fhir.publicJwk)

    return Response.json(publicJwk, {
        headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'public, max-age=300',
        },
        status: 200,
    })
}
