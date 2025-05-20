import { Faro, getWebInstrumentations, initializeFaro, OTELApi } from '@grafana/faro-web-sdk'
import { TracingInstrumentation } from '@grafana/faro-web-tracing'
import { lazyNextleton } from 'nextleton'

import { bundledEnv, isLocalOrDemo } from '@utils/env'

import { APP_NAME } from './common'

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

export function getBrowserOTEL(): OTELApi | null {
    const faro = getFaro()
    if (faro == null) return null

    return faro.api.getOTEL() ?? null
}
