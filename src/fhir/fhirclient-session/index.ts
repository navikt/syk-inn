import { lazyNextleton } from 'nextleton'

import { bundledEnv } from '@utils/env'
import { ServerStorage } from '@navikt/fhirclient-next'

import { FhirClientSessionInMem } from './inmem'
import { FhirClientSessionRedis } from './redis'

function getSessionStoreImplementation(): ServerStorage {
    switch (bundledEnv.NEXT_PUBLIC_RUNTIME_ENV) {
        case 'e2e':
        case 'demo':
            return new FhirClientSessionInMem()
        case 'local':
        case 'prod-gcp':
        case 'dev-gcp':
            return new FhirClientSessionRedis()
    }
}

export const getFhirSessionStorage = lazyNextleton('fhir-session-store', async () => {
    const store = getSessionStoreImplementation()

    if (store instanceof FhirClientSessionRedis) {
        await store.setup()
    }

    return store
})
