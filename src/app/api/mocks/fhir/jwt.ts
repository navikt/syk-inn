import { nextleton } from 'nextleton'
import { exportJWK, generateKeyPair, JWK, SignJWT } from 'jose'

import testData from './(resources)/data'

export const keyPair = nextleton('key-pair', async () => await generateKeyPair('RS256'))

export const publicJwk = async (): Promise<JWK> => {
    const { publicKey } = await keyPair

    return await exportJWK(publicKey)
}

export async function createIdToken(): Promise<string> {
    const token = await new SignJWT({
        profile: 'Practitioner/a1f1ed62-066a-4050-90f7-81e8f62eb3c2',
        fhirUser: 'Practitioner/a1f1ed62-066a-4050-90f7-81e8f62eb3c2',
    })
        .setProtectedHeader({ alg: 'RS256', kid: 'very-cool-kid' }) // Use the same 'kid' as in /keys
        .setIssuedAt()
        .setIssuer('http://localhost:3000/api/mocks/fhir')
        .setAudience('syk-inn')
        .setExpirationTime('2h')
        .sign((await keyPair).privateKey)

    return token
}

export async function createAccessToken(audience: string): Promise<string> {
    const token = await new SignJWT({
        yo: 'sup',
    })
        .setProtectedHeader({ alg: 'RS256', kid: 'very-cool-kid' }) // Use the same 'kid' as in /keys
        .setIssuedAt()
        .setIssuer(testData.fhirServer.wellKnown.issuer)
        .setAudience(audience)
        .sign((await keyPair).privateKey)

    return token
}
