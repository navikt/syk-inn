import { lazyNextleton } from 'nextleton'
import { exportJWK, importPKCS8, importSPKI, JWK, SignJWT } from 'jose'

import { fhirServerTestData } from '../meta/data/fhir-server'

import { testOnlyPrivateKey, testOnlyPublicKey } from './test-only-keys'

export const keyPair = lazyNextleton('key-pair', async () => {
    const privateKey = await importPKCS8(testOnlyPrivateKey, 'RS256')
    const publicKey = await importSPKI(testOnlyPublicKey, 'RS256')

    return { publicKey, privateKey }
})

export async function publicJwk(): Promise<JWK> {
    const { publicKey } = await keyPair()

    return await exportJWK(publicKey)
}

async function privateKey(): Promise<CryptoKey> {
    const { privateKey } = await keyPair()

    return privateKey
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
        .sign(await privateKey())

    return token
}

export async function createAccessToken(audience: string): Promise<string> {
    const token = await new SignJWT({
        yo: 'sup',
    })
        .setProtectedHeader({ alg: 'RS256', kid: 'very-cool-kid' }) // Use the same 'kid' as in /keys
        .setIssuedAt()
        .setIssuer(fhirServerTestData.wellKnown().issuer)
        .setAudience(audience)
        .sign(await privateKey())

    return token
}
