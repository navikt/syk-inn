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
    PILOT_FEEDBACK: {
        name: 'PILOT_FEEDBACK',
        ...on,
    },
    SYK_INN_AAREG: {
        name: 'SYK_INN_AAREG',
        ...on,
    },
    SYK_INN_SHOW_REDACTED: {
        name: 'SYK_INN_SHOW_REDACTED',
        ...on,
    },
    SYK_INN_SYKEFRAVAER_INFO: {
        name: 'SYK_INN_SYKEFRAVAER_INFO',
        ...on,
    },
    SYK_INN_AUTO_BIDIAGNOSER: {
        name: 'SYK_INN_AUTO_BIDIAGNOSER',
        ...on,
    },
    SYK_INN_REQUEST_HISTORISKE: {
        name: 'SYK_INN_REQUEST_HISTORISKE',
        ...on,
    },
    SYK_INN_FEEDBACK_V2: {
        name: 'SYK_INN_FEEDBACK_V2',
        ...on,
    },
}

export const localDevelopmentToggles: IToggle[] = Object.values(devToggles)
