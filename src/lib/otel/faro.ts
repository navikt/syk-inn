import { Faro, getWebInstrumentations, initializeFaro, OTELApi } from '@grafana/faro-web-sdk'
import { TracingInstrumentation } from '@grafana/faro-web-tracing'
import { lazyNextleton } from 'nextleton'

import { bundledEnv, isLocal, isDemo } from '@lib/env'

import { APP_NAME } from './common'

const getFaro = lazyNextleton('faro-a', (): Faro | null => {
    if (!bundledEnv.NEXT_PUBLIC_TELEMETRY_URL) return null

    return initializeFaro({
        paused: isLocal || isDemo,
        url: bundledEnv.NEXT_PUBLIC_TELEMETRY_URL,
        app: {
            name: APP_NAME,
            environment: bundledEnv.runtimeEnv,
            version: bundledEnv.NEXT_PUBLIC_VERSION ?? 'unknown',
        },
        instrumentations: [
            ...getWebInstrumentations({
                captureConsole: false,
            }),
            new TracingInstrumentation({}),
        ],
    })
})

export function getBrowserOTEL(): OTELApi | null {
    const faro = getFaro()
    if (faro == null) return null

    return faro.api.getOTEL() ?? null
}

export function getBrowserSessionId(): string | null {
    return getFaro()?.api.getSession()?.id ?? null
}
