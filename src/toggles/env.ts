import { IToggle } from '@unleash/nextjs'

import { bundledEnv } from '@utils/env'

import { EXPECTED_TOGGLES } from './toggles'

export function localDevelopmentToggles(): IToggle[] {
    return EXPECTED_TOGGLES.map(
        (it): IToggle => ({
            name: it,
            enabled: false,
            impressionData: false,
            variant: {
                enabled: true,
                name: 'default',
            },
        }),
    )
}

export function getUnleashEnvironment(): 'development' | 'production' {
    if (bundledEnv.NEXT_PUBLIC_RUNTIME_ENV === 'prod-gcp') {
        return 'production'
    }
    return 'development'
}
