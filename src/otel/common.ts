import type { ContextAPI as OTELContextAPI, TraceAPI as OTELTraceAPI } from '@opentelemetry/api'

export const APP_NAME = 'syk-inn'

export interface IsomorphicOTEL {
    trace: OTELTraceAPI
    context: OTELContextAPI
}
