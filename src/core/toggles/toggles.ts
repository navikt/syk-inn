export type Toggles = Record<ExpectedToggles, boolean>

export type ExpectedToggles = (typeof EXPECTED_TOGGLES)[number]
export const EXPECTED_TOGGLES = [
    // Access control
    'PILOT_USER',

    // Experiments
    'SYK_INN_AAREG',
    'SYK_INN_SHOW_REDACTED',
    'SYK_INN_SYKEFRAVAER_INFO',
    'SYK_INN_REQUEST_HISTORISKE',
    'SYK_INN_STRUCTURED_FHIR',
    'SYK_INN_STRUCTURED_FHIR_INLINE',

    // Feature rollouts (release)
    'SYK_INN_HELSEID_DOUBLE_AUTH_EXP',

    // Functional toggles
    'SYK_INN_FEEDBACK_KVITTERING',
    'SYK_INN_REQUIRE_BRUKSVILKAR',
] as const
