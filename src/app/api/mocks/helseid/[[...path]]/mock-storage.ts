import { HelseIdMockSession } from '@navikt/helseid-mock-server'
import { lazyNextleton } from 'nextleton'

export const getHelseIdMockStore = lazyNextleton('helseid-mock-session', () => new HelseIdMockSession())
