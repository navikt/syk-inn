import { Faro, getWebInstrumentations, initializeFaro, OTELApi } from '@grafana/faro-web-sdk'
import { TracingInstrumentation } from '@grafana/faro-web-tracing'
import { lazyNextleton } from 'nextleton'

import { bundledEnv, isLocalOrDemo } from '@utils/env'

const APP_NAME = 'syk-inn'

export const getFaro = lazyNextleton('faro-a', (): Faro | null => {
    if (bundledEnv.NEXT_PUBLIC_TELEMETRY_URL == null) return null

    return initializeFaro({
        paused: isLocalOrDemo,
        url: bundledEnv.NEXT_PUBLIC_TELEMETRY_URL,
        app: {
            name: APP_NAME,
            environment: bundledEnv.NEXT_PUBLIC_RUNTIME_ENV,
            // TODO: få commit hash fra serveren eller noe
            version: undefined,
        },
        instrumentations: [
            ...getWebInstrumentations({
                captureConsole: false,
            }),
            new TracingInstrumentation(),
        ],
    })
})

function getOTEL(): OTELApi | null {
    const faro = getFaro()
    if (faro == null) return null

    return faro.api.getOTEL() ?? null
}

export async function spanAsync<T>(name: string, fn: () => Promise<T>): Promise<T> {
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

export function withSpanAsync<T>(name: string, fn: () => Promise<T>): () => Promise<T> {
    return async () => spanAsync(name, fn)
}
