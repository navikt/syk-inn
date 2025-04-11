import { getConfig } from '../../config'

import { createWellKnown } from './well-known'
import { createKeys } from './keys'
import metadata from './metadata.json'

export const fhirServerTestData = {
    wellKnown: () => {
        const config = getConfig()

        return createWellKnown(`${config.baseUrl}${config.basePath ?? ''}${config.fhirPath}`)
    },
    keys: () => createKeys(),
    metadata: () => metadata,
}
