import { logger as pinoLogger } from '@navikt/pino-logger'

export const logger = pinoLogger.child({}, { msgPrefix: '[Smart Client] ' })
