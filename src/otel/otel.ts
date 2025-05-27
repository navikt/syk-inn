import { APP_NAME, IsomorphicOTEL } from './common'

function getOTEL(): IsomorphicOTEL | null {
    if (typeof window === 'undefined') {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const { getNodeOTEL } = require('./node')
        return getNodeOTEL()
    } else {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const { getBrowserOTEL } = require('./faro')
        return getBrowserOTEL()
    }
}

export async function spanAsync<Result>(name: string, fn: () => Promise<Result>): Promise<Result> {
    const otel = getOTEL()
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
