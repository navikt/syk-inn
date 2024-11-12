import { headers } from 'next/headers'

import { getHelseIdWellKnown } from './helse-id'

export async function getHelseIdUserInfo(): Promise<Record<string, unknown>> {
    const wellKnown = await getHelseIdWellKnown()
    const response = await fetch(wellKnown.userinfo_endpoint, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${await getHelseIdAccessToken()}`,
        },
    })

    if (!response.ok) {
        throw new Error(`Failed to fetch user info: ${response.statusText}`)
    }

    return response.json()
}

export async function getHelseIdAccessToken(): Promise<string> {
    const bearerToken = (await headers()).get('Authorization')

    if (!bearerToken) {
        throw new Error('No bearer token found')
    }

    return bearerToken.replace('Bearer ', '')
}
