import { cookies } from 'next/headers'

import { Toggles } from '@core/toggles/toggles'
import { unleashLogger } from '@core/toggles/unleash'
import { bundledEnv } from '@lib/env'
import { localDevelopmentToggles } from '@core/toggles/dev/local'

export async function developmentTogglesWithCookieOverrides(): Promise<Toggles> {
    const cookieStore = await cookies()
    const localDevelopmentCookiesWithOverrides = localDevelopmentToggles.map((it) => {
        const enabledByCookieOrNull = cookieStore.get(it.name)?.value.includes('true') ?? null
        return {
            ...it,
            enabled: enabledByCookieOrNull ?? it.enabled,
            overriden: (enabledByCookieOrNull ?? false) !== it.enabled,
        }
    })

    const toggleStatus = localDevelopmentCookiesWithOverrides
        .map((it) => `\t${it.name}: ${it.enabled}${it.overriden ? ' (overridden)' : ''}`)
        .join('\n')

    unleashLogger.warn(`Runtime env is ${bundledEnv.runtimeEnv}, using dev toggles, current toggles: \n${toggleStatus}`)

    return localDevelopmentCookiesWithOverrides
}
