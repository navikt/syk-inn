import { context, Span, SpanStatusCode, trace } from '@opentelemetry/api'
import { logger } from '@navikt/next-logger'

import { APP_NAME } from './common'

export async function spanServerAsync<Result>(name: string, fn: (span: Span) => Promise<Result>): Promise<Result> {
    const tracer = trace.getTracer(APP_NAME)
    const span = tracer.startSpan(name)
    return context.with(trace.setSpan(context.active(), span), async () => fn(span).finally(() => span.end()))
}

export function withSpanServerAsync<Result, Args extends unknown[]>(
    name: string,
    fn: (...args: Args) => Promise<Result>,
): (...args: Args) => Promise<Result> {
    return async (...args) => spanServerAsync(name, () => fn(...args))
}

/**
 * Marks the span as failed, as well as logs the exception.
 */
export function failServerSpan(span: Span, error: Error): void {
    logger.error(error)

    span.recordException(error)
    span.setStatus({ code: SpanStatusCode.ERROR, message: error.message })
}
