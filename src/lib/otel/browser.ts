import { APP_NAME } from '@lib/otel/common'
import { getBrowserOTEL } from '@lib/otel/faro'

export function spanBrowserAsync<Result>(name: string, fn: () => Promise<Result>): Promise<Result> {
    const otel = getBrowserOTEL()
    if (otel == null) {
        return fn()
    }

    const tracer = otel.trace.getTracer(APP_NAME)
    const span = tracer.startSpan(name)
    return otel.context.with(otel.trace.setSpan(otel.context.active(), span), async () =>
        fn().finally(() => span.end()),
    )
}

export function withSpanBrowserAsync<Result, Args extends unknown[]>(
    name: string,
    fn: (...args: Args) => Promise<Result>,
): (...args: Args) => Promise<Result> {
    return async (...args) => spanBrowserAsync(name, () => fn(...args))
}
