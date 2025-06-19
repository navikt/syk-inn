import { APP_NAME, IsomorphicOTEL } from './common'

async function getOTEL(): Promise<IsomorphicOTEL | null> {
    if (typeof window === 'undefined') {
        const { getNodeOTEL } = await import('./node')
        return getNodeOTEL()
    } else {
        const { getBrowserOTEL } = await import('./faro')
        return getBrowserOTEL()
    }
}

export async function spanAsync<Result>(name: string, fn: () => Promise<Result>): Promise<Result> {
    const otel = await getOTEL()
    if (otel == null) {
        return fn()
    }

    const tracer = otel.trace.getTracer(APP_NAME)
    const span = tracer.startSpan(name)
    return otel.context.with(otel.trace.setSpan(otel.context.active(), span), async () =>
        fn().finally(() => span.end()),
    )
}

export function withSpanAsync<Result, Args extends unknown[]>(
    name: string,
    fn: (...args: Args) => Promise<Result>,
): (...args: Args) => Promise<Result> {
    return async (...args) => spanAsync(name, () => fn(...args))
}
