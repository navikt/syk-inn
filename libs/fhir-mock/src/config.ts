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
            '@navikt/fhir-mock config not set. Please configure a route with createFhirHandler with proper options.',
        )
    }

    return config
}
