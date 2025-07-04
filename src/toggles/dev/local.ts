/* eslint-disable @typescript-eslint/no-unused-vars */

import { IToggle } from '@unleash/nextjs'

import { ExpectedToggles } from '../toggles'

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
