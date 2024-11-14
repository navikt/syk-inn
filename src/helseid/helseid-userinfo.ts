import 'server-only'

import { getHelseIdAccessToken, getHelseIdWellKnown } from './helseid-resources'

export async function getHelseIdUserInfo(): Promise<Record<string, unknown>> {
    const wellKnown = await getHelseIdWellKnown()
    const response = await fetch(wellKnown.userinfo_endpoint, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${await getHelseIdAccessToken()}`,
        },
        cache: 'no-store',
    })

    if (!response.ok) {
        throw new Error(`Failed to fetch user info: ${response.statusText}`)
    }

    return response.json()
}
