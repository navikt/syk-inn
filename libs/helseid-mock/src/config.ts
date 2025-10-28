export type HelseIdMockConfig = {
    /**
     * Base URL the mock server is running on. This is used to generate the correct
     * URLs for the mock server for .well-known and such.
     */
    baseUrl: string
    /**
     * The actual path the mock routes are running on, for example /api/helseid-mock
     */
    helseIdPath: string
}

let config: HelseIdMockConfig | null = null

export function setConfig(newConfig: HelseIdMockConfig): HelseIdMockConfig {
    config = { ...config, ...newConfig }

    return config
}

export function getConfig(): HelseIdMockConfig {
    if (config == null) {
        throw new Error(
            '@navikt/helseid-mock-server config not set. Please configure a route with createHelseIdHandler with proper options.',
        )
    }

    return config
}
