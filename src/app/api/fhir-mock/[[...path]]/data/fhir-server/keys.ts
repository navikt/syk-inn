import { publicJwk } from '../../../jwt'

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export const createKeys = async () => {
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
