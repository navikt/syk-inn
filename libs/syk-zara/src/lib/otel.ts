import { context, Span, trace } from '@opentelemetry/api'

export async function spanServerAsync<Result>(name: string, fn: (span: Span) => Promise<Result>): Promise<Result> {
    const tracer = trace.getTracer('syk-zara')
    const span = tracer.startSpan(name)
    return context.with(trace.setSpan(context.active(), span), async () => fn(span).finally(() => span.end()))
}
