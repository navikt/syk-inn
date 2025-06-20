import { trace, context, Span } from '@opentelemetry/api'

const LIB_NAME = '@navikt/smart-on-fhir'
const LIB_VERSION = '0.0.1-alpha.0'
const SPAN_PREFIX = 'SmartClient.'

export async function spanAsync<Result>(name: string, fn: (span: Span) => Promise<Result>): Promise<Result> {
    const tracer = trace.getTracer(LIB_NAME, LIB_VERSION)
    const span = tracer.startSpan(`${SPAN_PREFIX}${name}`)

    return context.with(trace.setSpan(context.active(), span), async () => fn(span).finally(() => span.end()))
}

export function spanSync<Result>(name: string, fn: () => Result): Result {
    const tracer = trace.getTracer(LIB_NAME, LIB_VERSION)
    const span = tracer.startSpan(`${SPAN_PREFIX}${name}`)

    return context.with(trace.setSpan(context.active(), span), () => {
        try {
            return fn()
        } finally {
            span.end()
        }
    })
}
