import { router } from './src/router'
import { setConfig } from './src/config'

setConfig({
    fhirPath: '/',
    baseUrl: 'http://localhost:3000',
})

// @ts-expect-error Just a bun script, no types
Bun.serve({
    port: process.env.PORT ?? 3000,
    fetch: router.fetch,
    idleTimeout: 0,
})
