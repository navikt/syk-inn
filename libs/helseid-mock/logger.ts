import { logger as pinoLogger } from '@navikt/pino-logger'

export const helseIdLogger = pinoLogger.child({}, { msgPrefix: '[HELSEID-MOCK] ' })
