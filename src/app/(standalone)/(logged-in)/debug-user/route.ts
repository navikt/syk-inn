import { NextResponse } from 'next/server'

import {
    decodeHelseIdIdToken,
    getHelseIdBehandler,
    fetchHelseIdUserInfo,
    validateHelseIdAccessToken,
    validateHelseIdDPoPToken,
} from '#core/auth/helseid/helseid'
import {
    getWonderwallHelseIdAccessToken,
    getWonderwallHelseIdDPoPToken,
    getWonderwallHelseIdIdToken,
} from '#core/auth/helseid/wonderwall-tokens'
import { getUserlessToggles, getUserToggles, toToggleMap } from '#core/toggles/unleash'
import { spanServerAsync } from '#lib/otel/server'

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
        validToken: await validateHelseIdAccessToken().catch((it) =>
            it instanceof Error ? it.message : 'Unknown error',
        ),
        idToken: await decodeHelseIdIdToken().catch((it) => (it instanceof Error ? it.message : 'Unknown error')),
        userInfo: await fetchHelseIdUserInfo().catch((it) => (it instanceof Error ? it.message : 'Unknown error')),
        raw: {
            id_token: await getWonderwallHelseIdIdToken(),
            access_token: await getWonderwallHelseIdAccessToken(),
        },
        validDPoPToken: await validateHelseIdDPoPToken(),
        dpop: await getWonderwallHelseIdDPoPToken(),
    })
}
