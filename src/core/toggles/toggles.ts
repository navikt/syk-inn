export type Toggles = Record<ExpectedToggles, boolean>

export type ExpectedToggles = (typeof EXPECTED_TOGGLES)[number]
export const EXPECTED_TOGGLES = [
    'PILOT_USER',
    'SYK_INN_AAREG',
    'SYK_INN_SHOW_REDACTED',
    'SYK_INN_SYKEFRAVAER_INFO',
    'SYK_INN_AUTO_BIDIAGNOSER',
    'SYK_INN_REQUEST_HISTORISKE',
] as const
