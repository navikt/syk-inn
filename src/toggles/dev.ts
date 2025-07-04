/* eslint-disable @typescript-eslint/no-unused-vars */

import { IToggle } from '@unleash/nextjs'
import { cookies } from 'next/headers'

import { bundledEnv } from '@utils/env'
import { unleashLogger } from '@toggles/unleash'

import { ExpectedToggles, Toggles } from './toggles'

const on: Omit<IToggle, 'name'> = {
    enabled: true,
    impressionData: false,
    variant: { enabled: true, name: 'default' },
}

const off: Omit<IToggle, 'name'> = {
    enabled: false,
    impressionData: false,
    variant: { enabled: false, name: 'default' },
}

const devToggles: Record<ExpectedToggles, IToggle> = {
    PILOT_USER: {
        name: 'PILOT_USER',
        ...on,
    },
    SYK_INN_REFRESH_TOKEN: {
        name: 'SYK_INN_REFRESH_TOKEN',
        ...off,
    },
}

export const localDevelopmentToggles: IToggle[] = Object.values(devToggles)

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
