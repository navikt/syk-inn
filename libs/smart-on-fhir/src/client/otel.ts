import { trace, context, Span } from '@opentelemetry/api'

export async function spanAsync<Result>(name: string, fn: (span: Span) => Promise<Result>): Promise<Result> {
    const tracer = trace.getTracerProvider().getTracer('')
    const span = tracer.startSpan(`SmartClient.${name}`)

    return context.with(trace.setSpan(context.active(), span), async () => fn(span).finally(() => span.end()))
}

export function spanSync<Result>(name: string, fn: () => Result): Result {
    const tracer = trace.getTracerProvider().getTracer('')
    const span = tracer.startSpan(`SmartClient.${name}`)

    return context.with(trace.setSpan(context.active(), span), () => {
        try {
            return fn()
        } finally {
            span.end()
        }
    })
}
