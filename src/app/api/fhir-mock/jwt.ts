import { nextleton } from 'nextleton'
import { exportJWK, generateKeyPair, JWK, SignJWT } from 'jose'

export const keyPair = nextleton('key-pair', async () => await generateKeyPair('RS256'))

export const publicJwk = async (): Promise<JWK> => {
    const { publicKey } = await keyPair

    return await exportJWK(publicKey)
}

export async function createToken(): Promise<string> {
    const token = await new SignJWT({ some: 'payload' }) // Add claims you want
        .setProtectedHeader({ alg: 'RS256', kid: 'very-cool-kid' }) // Use the same 'kid' as in /keys
        .setIssuedAt()
        .setIssuer('http://localhost:3000/api/fhir-mock/fhir')
        .setAudience('what')
        .setExpirationTime('2h')
        .sign((await keyPair).privateKey)

    return token
}