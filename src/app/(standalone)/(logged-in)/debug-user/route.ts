import { NextResponse } from 'next/server'

import { getUserlessToggles, getUserToggles, toToggleMap } from '#core/toggles/unleash'
import { getHelseIdBehandler } from '#data-layer/helseid/helseid-service'
import { getHelseIdIdTokenInfo, getHelseIdUserInfo } from '#data-layer/helseid/helseid-user'
import { getHelseIdAccessToken, getHelseIdIdToken } from '#data-layer/helseid/token/tokens'
import { validateHelseIdToken } from '#data-layer/helseid/token/validate'
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
        validToken: await validateHelseIdToken().catch((it) => (it instanceof Error ? it.message : 'Unknown error')),
        idToken: await getHelseIdIdTokenInfo().catch((it) => (it instanceof Error ? it.message : 'Unknown error')),
        userInfo: await getHelseIdUserInfo().catch((it) => (it instanceof Error ? it.message : 'Unknown error')),
        raw: {
            id_token: await getHelseIdIdToken(),
            access_token: await getHelseIdAccessToken(),
        },
    })
}
