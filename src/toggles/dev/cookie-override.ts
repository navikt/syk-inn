import { cookies } from 'next/headers'

import { Toggles } from '@toggles/toggles'
import { unleashLogger } from '@toggles/unleash'
import { bundledEnv } from '@utils/env'
import { localDevelopmentToggles } from '@toggles/dev/local'

export async function developmentTogglesWithCookieOverrides(): Promise<Toggles> {
    const cookieStore = await cookies()
    const localDevelopmentCookiesWithOverrides = localDevelopmentToggles.map((it) => ({
        ...it,
        enabled: cookieStore.get(it.name)?.value.includes('true') ?? it.enabled,
        overriden: cookieStore.get(it.name)?.value.includes('true'),
    }))

    const toggleStatus = localDevelopmentCookiesWithOverrides
        .map((it) => `\t${it.name}: ${it.enabled}${it.overriden ? ' (overridden)' : ''}`)
        .join('\n')

    unleashLogger.warn(
        `Runtime env is ${bundledEnv.NEXT_PUBLIC_RUNTIME_ENV}, using dev toggles, current toggles: \n${toggleStatus}`,
    )

    return localDevelopmentCookiesWithOverrides
}
