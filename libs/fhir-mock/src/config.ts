import { FhirMockSession } from './server-session'

export type FhirClient = {
    clientId: string
    method: 'client_secret_post' | 'client_secret_basic'
    clientSecret: string
}

export type FhirMockConfig = {
    /**
     * Base URL the mock server is running on. This is used to generate the correct
     * URLs for the mock server for .well-known and such.
     */
    baseUrl: string
    /**
     * The actual path the mock routes are running on, for example /api/fhir-mock
     */
    fhirPath: string
    /**
     * Configured clients
     */
    clients: FhirClient[]
    /**
     * A session store used for persisting launches, this mocks the FHIR servers state, i.e. clients
     * launch state state, their associated patients etc., especially important since every time the
     * launch session is initiated, all IDs are regenerated.
     *
     * If using Nextjs or any other hot-reloading dev-server, make sure this reference is stable.
     */
    store: FhirMockSession | (() => FhirMockSession)
    /**
     * Optional base path, if the server is running on a base path in for example Next.JS
     *
     * If fhirPath contains the entire basePath as well, this is not needed, but can be useful if
     * server sometimes has basePath and needs to be configured seperately.
     */
    basePath?: string | null | undefined
}

let config: FhirMockConfig | null = null

export function setConfig(newConfig: FhirMockConfig): FhirMockConfig {
    config = { ...config, ...newConfig }

    return config
}

export function getConfig(): FhirMockConfig {
    if (config == null) {
        throw new Error(
            '@navikt/fhir-mock-server config not set. Please configure a route with createFhirHandler with proper options.',
        )
    }

    return config
}

export const getServerSession = (): FhirMockSession => {
    const config = getConfig()

    return typeof config.store === 'function' ? config.store() : config.store
}
