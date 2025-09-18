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

interface FailSpan {
    (span: Span, what: string): void
    (span: Span, what: string, error: Error): void
    (span: Span, what: string, error?: Error): void
    andThrow: (span: Span, what: string, error: Error) => never
    silently: (span: Span, reason: string, cause?: Error) => void
}

/**
 * Marks the span as failed, as well as logs the exception.
 */
export const failSpan: FailSpan = ((span, what, error): void => {
    logger.error(error)

    if (error) {
        span.recordException(error)
        // OTEL does not support `cause`, but multiple recordException will create multiple events on the span
        if (error.cause != null) {
            span.recordException(error.cause instanceof Error ? error.cause : new Error(error.cause as string))
        }
    }

    span.setStatus({ code: SpanStatusCode.ERROR, message: what })
}) as FailSpan

failSpan.andThrow = (span: Span, what: string, error: Error): never => {
    failSpan(span, what, error)
    throw error
}

failSpan.silently = (span: Span, reason: string, cause?: Error): void => {
    if (cause) {
        span.recordException(cause)
        if (cause.cause != null) {
            span.recordException(cause.cause instanceof Error ? cause.cause : new Error(cause.cause as string))
        }
    }

    span.setStatus({ code: SpanStatusCode.ERROR, message: reason })
}
