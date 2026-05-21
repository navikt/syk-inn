import { IToggle } from '@unleash/nextjs'

import { raise } from '@lib/ts'

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
    SYK_INN_AAREG: {
        name: 'SYK_INN_AAREG',
        ...on,
    },
    SYK_INN_SYKMELDING_BEHANDLINGSDAGER: {
        name: 'SYK_INN_SYKMELDING_BEHANDLINGSDAGER',
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
    SYK_INN_REQUEST_HISTORISKE: {
        name: 'SYK_INN_REQUEST_HISTORISKE',
        ...on,
    },
    SYK_INN_FEEDBACK_KVITTERING: {
        name: 'SYK_INN_FEEDBACK_KVITTERING',
        ...on,
    },
    SYK_INN_REQUIRE_BRUKSVILKAR: {
        name: 'SYK_INN_REQUIRE_BRUKSVILKAR',
        ...off,
    },
    SYK_INN_STRUCTURED_FHIR: {
        name: 'SYK_INN_STRUCTURED_FHIR',
        ...on,
    },
    SYK_INN_STRUCTURED_FHIR_INLINE: {
        name: 'SYK_INN_STRUCTURED_FHIR_INLINE',
        ...on,
    },
    SYK_INN_HELSEID_DOUBLE_AUTH_EXP: {
        name: 'SYK_INN_HELSEID_DOUBLE_AUTH_EXP',
        ...off
    }
}

for (const [key, value] of Object.entries(devToggles)) {
    if (key !== value.name) {
        raise(`You messed up! Key ${key} needs to have the same name property.`)
    }
}

export const localDevelopmentToggles: IToggle[] = Object.values(devToggles)
