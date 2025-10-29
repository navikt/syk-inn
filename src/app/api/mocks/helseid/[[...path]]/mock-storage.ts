import { lazyNextleton } from 'nextleton'

import { HelseIdMockSession } from '@navikt/helseid-mock-server/next'

export const getHelseIdMockStore = lazyNextleton('helseid-mock-session', () => new HelseIdMockSession())
