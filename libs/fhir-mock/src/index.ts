import { FhirMockConfig, setConfig } from './config'
import { router } from './router'

/**
 * Creates a (req: Request) => Promise<Response> handler for the fhir mock server.
 *
 * Required, you need to inform the mock routes about paths and stuff
 * @param config
 */
export function createFhirHandler(config: FhirMockConfig) {
    setConfig(config)

    return async (request: Request) => router.fetch(request)
}
