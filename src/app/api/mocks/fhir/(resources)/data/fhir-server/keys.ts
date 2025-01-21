import { JSONWebKeySet } from 'jose'

import { publicJwk } from '../../../jwt'

export const createKeys = async (): Promise<JSONWebKeySet> => {
    const jwk = await publicJwk()

    return {
        keys: [
            {
                kty: jwk.kty,
                kid: 'very-cool-kid',
                alg: 'RS256',
                use: 'sig',
                n: jwk.n,
                e: jwk.e,
            },
        ],
    }
}
