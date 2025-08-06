import { IToggle } from '@unleash/nextjs'

export type Toggle = IToggle
export type Toggles = IToggle[]

export type ExpectedToggles = (typeof EXPECTED_TOGGLES)[number]
export const EXPECTED_TOGGLES = [
    'PILOT_USER',
    'SYK_INN_REFRESH_TOKEN',
    'SYK_INN_AAREG',
    'SYK_INN_SHOW_REDACTED',
] as const
