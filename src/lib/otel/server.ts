import { logger } from '@navikt/next-logger'
import { context, Span, SpanStatusCode, trace } from '@opentelemetry/api'

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
    (span: Span, what: string, error: unknown): void
    andThrow: (span: Span, what: string, error: Error) => never
    silently: (span: Span, reason: string, cause?: Error) => void
}

/**
 * Marks the span as failed, as well as logs the exception (if defined).
 */
export const failSpan: FailSpan = ((span, what, error): void => {
    span.setStatus({ code: SpanStatusCode.ERROR, message: what })

    // Log both errors and unknowns
    if (error) logger.error(error)

    // Only record exceptions for proper errors, with causes if applicable
    if (error instanceof Error) {
        span.recordException(error)
        // OTEL does not support `cause`, but multiple recordException will create multiple events on the span
        if (error.cause != null) {
            span.recordException(error.cause instanceof Error ? error.cause : new Error(error.cause as string))
        }
    } else if (error != null) {
        // For unknown errors, we can wrap them in a cause so they propagate to the span
        span.recordException(new Error('Unknown error', { cause: error }))
    }
}) as FailSpan

failSpan.andThrow = (span: Span, what: string, error: unknown): never => {
    failSpan(span, what, error)
    throw error
}

failSpan.silently = (span: Span, reason: string, cause?: unknown): void => {
    if (cause instanceof Error) {
        span.recordException(cause)
        if (cause.cause != null) {
            span.recordException(cause.cause instanceof Error ? cause.cause : new Error(cause.cause as string))
        }
    } else if (cause != null) {
        span.recordException(new Error('Unknown error', { cause }))
    }

    span.setStatus({ code: SpanStatusCode.ERROR, message: reason })
}
