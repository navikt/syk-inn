export function createTestAccessToken(expiresIn: number): string {
    const claims = {
        iss: 'https://fhir-server.com',
        sub: '1234567890',
        aud: 'test-client',
        exp: Math.floor(Date.now() / 1000) + expiresIn,
        scope: 'openid fhirUser launch/patient',
    }

    return `mocked-access-token.${Buffer.from(JSON.stringify(claims)).toString('base64')}.signature`
}

export function createTestIdToken(claims: Record<string, unknown>): string {
    return `mocked-id-token.${Buffer.from(JSON.stringify(claims)).toString('base64')}.signature`
}
