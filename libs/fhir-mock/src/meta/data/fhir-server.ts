import { getConfig } from '../../config'

import { createKeys } from './keys'
import metadata from './metadata.json'
import { createWellKnown } from './well-known'

export const fhirServerTestData = {
    wellKnown: () => {
        const config = getConfig()

        return createWellKnown(`${config.baseUrl}${config.basePath ?? ''}${config.fhirPath}`)
    },
    keys: () => createKeys(),
    metadata: () => metadata,
}
