import { logger as pinoLogger } from '@navikt/pino-logger'

export const fhirLogger = pinoLogger.child({}, { msgPrefix: '[FHIR-MOCK] ' })
