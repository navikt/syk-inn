import { IToggle } from '@unleash/nextjs'

import { bundledEnv } from '@utils/env'

import { ExpectedToggles } from './toggles'

const devToggles: Record<ExpectedToggles, IToggle> = {
    SYK_INN_DEBUG_WAIT_BEFORE_LAUNCH: {
        name: 'SYK_INN_DEBUG_WAIT_BEFORE_LAUNCH',
        enabled: false,
        impressionData: false,
        variant: { enabled: true, name: 'default' },
    },
    SYK_INN_SECURE_AUTH: {
        name: 'SYK_INN_SECURE_AUTH',
        enabled: false,
        impressionData: false,
        variant: { enabled: true, name: 'default' },
    },
    SYK_INN_MULTISTEP_FORM_V1: {
        name: 'SYK_INN_MULTISTEP_FORM_V1',
        enabled: true,
        impressionData: false,
        variant: { enabled: true, name: 'default' },
    },
}

export function localDevelopmentToggles(): IToggle[] {
    return Object.values(devToggles)
}

export function getUnleashEnvironment(): 'development' | 'production' {
    if (bundledEnv.NEXT_PUBLIC_RUNTIME_ENV === 'prod-gcp') {
        return 'production'
    }
    return 'development'
}
