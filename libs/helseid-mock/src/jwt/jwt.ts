import { lazyNextleton } from 'nextleton'
import { exportJWK, importPKCS8, importSPKI, JWK, SignJWT } from 'jose'

import { helseIdServerMeta } from '../meta/data/helseid-server'
import { HelseIdBehandler } from '../data/behandlere'

import { testOnlyPrivateKey, testOnlyPublicKey } from './test-only-keys'

const keyPair = lazyNextleton('helse-id-key-pair', async () => {
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

export async function createIdToken(behandler: HelseIdBehandler): Promise<string> {
    return await new SignJWT({
        'helseid://claims/identity/pid': behandler.pid,
        'helseid://claims/hpr/hpr_number': behandler.hpr,
        name: behandler.name,
    })
        .setProtectedHeader({ alg: 'RS256', kid: 'very-cool-kid' }) // Use the same 'kid' as in /keys
        .setIssuedAt()
        .setIssuer(helseIdServerMeta.wellKnown().issuer)
        .setAudience('syk-inn')
        .setExpirationTime('2h')
        .sign(await privateKey())
}

export async function createAccessToken(audience: string, code: string): Promise<string> {
    return await new SignJWT({ jti: code })
        .setProtectedHeader({ alg: 'RS256', kid: 'very-cool-kid' }) // Use the same 'kid' as in /keys
        .setIssuedAt()
        .setIssuer(helseIdServerMeta.wellKnown().issuer)
        .setAudience(audience)
        .sign(await privateKey())
}
