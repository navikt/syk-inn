export function createTestIdToken(claims: Record<string, unknown>): string {
    return `mocked-id-token.${Buffer.from(JSON.stringify(claims)).toString('base64')}.signature`
}
