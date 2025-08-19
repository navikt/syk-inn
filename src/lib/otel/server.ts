import { context, Span, SpanStatusCode, trace } from '@opentelemetry/api'
import { suppressTracing } from '@opentelemetry/core'
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
export function failServerSpan(span: Span, what: string, error: Error): void {
    logger.error(error)

    span.recordException(error)
    // OTEL does not support `cause`, but multiple recordException will create multiple events on the span
    if (error.cause != null) {
        span.recordException(error.cause instanceof Error ? error.cause : new Error(error.cause as string))
    }
    span.setStatus({ code: SpanStatusCode.ERROR, message: what })
}

export async function squelchTracing<Result>(fn: () => Promise<Result>): Promise<Result> {
    return context.with(suppressTracing(context.active()), () => fn())
}
