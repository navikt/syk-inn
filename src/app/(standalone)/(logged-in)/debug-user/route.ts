import { NextResponse } from 'next/server'

import { getUserlessToggles, getUserToggles, toToggleMap } from '@core/toggles/unleash'
import { spanServerAsync } from '@lib/otel/server'
import { getHelseIdBehandler } from '@data-layer/helseid/helseid-service'
import { getHelseIdIdTokenInfo, getHelseIdUserInfo } from '@data-layer/helseid/helseid-user'
import { validateHelseIdToken } from '@data-layer/helseid/token/validate'

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
        validToken: await validateHelseIdToken(),
        idToken: await getHelseIdIdTokenInfo(),
        userInfo: await getHelseIdUserInfo(),
    })
}
