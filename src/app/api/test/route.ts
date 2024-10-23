import { headers } from 'next/headers'

import { verifyFhirToken } from '@fhir/auth/verify'

export async function GET(): Promise<Response> {
    const token = (await headers()).get('Authorization')

    try {
        await verifyFhirToken(token!)
        return new Response('OK (see logs)')
    } catch (e) {
        return new Response('Oh no :( (see logs)')
    }
}
