import { logger as pinoLogger } from '@navikt/pino-logger'

export const gcpLogger = pinoLogger.child({}, { msgPrefix: '[GCP-MOCK] ' })
