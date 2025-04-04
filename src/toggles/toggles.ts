import { IToggle } from '@unleash/nextjs'

export type Toggle = IToggle
export type Toggles = IToggle[]

export type ExpectedToggles = (typeof EXPECTED_TOGGLES)[number]
export const EXPECTED_TOGGLES = [
    'SYK_INN_DEBUG_WAIT_BEFORE_LAUNCH',
    'SYK_INN_TIDLIGERE_SYKMELDINGER',
    'SYK_INN_MULTISTEP_FORM_V1',
] as const
