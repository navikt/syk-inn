import { trace, context } from '@opentelemetry/api'

export async function spanAsync<Result>(name: string, fn: () => Promise<Result>): Promise<Result> {
    const tracer = trace.getTracer('@navikt/smart-on-fhir')
    const span = tracer.startSpan(name)

    return context.with(trace.setSpan(context.active(), span), async () => fn().finally(() => span.end()))
}

export function spanSync<Result>(name: string, fn: () => Result): Result {
    const tracer = trace.getTracer('@navikt/smart-on-fhir')
    const span = tracer.startSpan(name)

    return context.with(trace.setSpan(context.active(), span), () => {
        try {
            return fn()
        } finally {
            span.end()
        }
    })
}
