import { NextResponse } from 'next/server'

import {
    decodeHelseIdIdToken,
    getHelseIdBehandler,
    fetchHelseIdUserInfo,
    validateHelseIdAccessToken,
} from '#core/auth/helseid/helseid'
import { verifyHelseIdDPoPToken, verifyHelseIdToken } from '#core/auth/helseid/token/validate'
import {
    getWonderwallHelseIdAccessToken,
    getWonderwallHelseIdDPoPToken,
    getWonderwallHelseIdIdToken,
} from '#core/auth/helseid/wonderwall-tokens'
import { getUserlessToggles, getUserToggles, toToggleMap } from '#core/toggles/unleash'
import { spanServerAsync } from '#lib/otel/server'
import { raise } from '#lib/ts'

export async function GET(): Promise<NextResponse> {
    const [toggles, behandler] = await spanServerAsync('DebugUser toggles', async () => {
        const userInfo = await getHelseIdBehandler()
        if (userInfo?.hpr == null) {
            return [await getUserlessToggles(), userInfo]
        }
        return [await getUserToggles(userInfo.hpr), userInfo]
    })

    return NextResponse.json({
        hpr: behandler?.hpr ?? 'missing',
        toggles: toToggleMap(toggles),
        auth: {
            validToken: await validateHelseIdAccessToken().catch((it) =>
                it instanceof Error ? it.message : 'Unknown error',
            ),
            idToken: await decodeHelseIdIdToken().catch((it) => (it instanceof Error ? it.message : 'Unknown error')),
            dpop: {
                dpopEnabled: process.env.WONDERWALL_OPENID_DPOP === 'true',
                raw: await getWonderwallHelseIdDPoPToken(),
                validDPoPToken: await getWonderwallHelseIdDPoPToken()
                    .then((it) => (it == null ? raise('No DPoP header found') : it))
                    .then((it) => verifyHelseIdDPoPToken(it.token, it.proof))
                    .catch((it) => (it instanceof Error ? it.message : 'Unknown error')),
                userInfo: await getWonderwallHelseIdDPoPToken()
                    .then((it) => (it == null ? raise('No bearer token found') : it))
                    .then((it) => fetchHelseIdUserInfo(it.token))
                    .catch((it) => (it instanceof Error ? it.message : 'Unknown error')),
            },
            bearer: {
                validBearer: await getWonderwallHelseIdAccessToken()
                    .then((it) => (it == null ? raise('No bearer token found') : it))
                    .then(verifyHelseIdToken)
                    .catch((it) => (it instanceof Error ? it.message : 'Unknown error')),
                raw: {
                    id_token: await getWonderwallHelseIdIdToken(),
                    access_token: await getWonderwallHelseIdAccessToken(),
                },
                userInfo: await getWonderwallHelseIdAccessToken()
                    .then((it) => (it == null ? raise('No bearer token found') : it))
                    .then(fetchHelseIdUserInfo)
                    .catch((it) => (it instanceof Error ? it.message : 'Unknown error')),
            },
        },
    })
}
