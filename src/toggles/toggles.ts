import { IToggle } from '@unleash/nextjs'

export type Toggle = IToggle
export type Toggles = IToggle[]

export type ExpectedToggles = (typeof EXPECTED_TOGGLES)[number]
export const EXPECTED_TOGGLES = ['SYK_INN_SECURE_AUTH', 'SYK_INN_DEBUG_WAIT_BEFORE_LAUNCH'] as const
