import { headers } from 'next/headers'

import { verifyFhirToken } from '@fhir/auth/verify'

export async function GET(): Promise<Response> {
    const token = headers().get('Authorization')

    await verifyFhirToken(token!)

    return new Response('OK')
}
