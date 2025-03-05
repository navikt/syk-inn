/* eslint-disable @typescript-eslint/no-unused-vars */

import { IToggle } from '@unleash/nextjs'

import { ExpectedToggles } from './toggles'

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
    SYK_INN_DEBUG_WAIT_BEFORE_LAUNCH: {
        name: 'SYK_INN_DEBUG_WAIT_BEFORE_LAUNCH',
        ...off,
    },
    SYK_INN_TIDLIGERE_SYKMELDINGER: {
        name: 'SYK_INN_TIDLIGERE_SYKMELDINGER',
        ...off,
    },
    SYK_INN_MULTISTEP_FORM_V1: {
        name: 'SYK_INN_MULTISTEP_FORM_V1',
        ...off,
    },
}

export const localDevelopmentToggles: IToggle[] = Object.values(devToggles)
