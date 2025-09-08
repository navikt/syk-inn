import { cookies } from 'next/headers'
import { IToggle } from '@unleash/nextjs'

import { unleashLogger } from '@core/toggles/unleash'
import { bundledEnv } from '@lib/env'
import { localDevelopmentToggles } from '@core/toggles/dev/local'

export async function developmentTogglesWithCookieOverrides(): Promise<IToggle[]> {
    const cookieStore = await cookies()
    const localDevelopmentCookiesWithOverrides = localDevelopmentToggles.map((it) => {
        const enabledByCookieOrNull = cookieStore.get(it.name)?.value.includes('true') ?? null

        return {
            ...it,
            enabled: enabledByCookieOrNull ?? it.enabled,
            status: enabledByCookieOrNull ? 'override' : 'config',
        }
    })

    const toggleStatus = localDevelopmentCookiesWithOverrides
        .map((it) => `\t${it.name}: ${it.enabled} (${it.status})`)
        .join('\n')

    unleashLogger.warn(`Runtime env is ${bundledEnv.runtimeEnv}, using dev toggles, current toggles: \n${toggleStatus}`)

    return localDevelopmentCookiesWithOverrides
}
