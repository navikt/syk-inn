import { getConfig } from '../../config'

import { createWellKnown } from './well-known'
import { createKeys } from './keys'

export const helseIdServerMeta = {
    wellKnown: () => {
        const config = getConfig()

        return createWellKnown(`${config.baseUrl}${config.helseIdPath ?? ''}`)
    },
    keys: () => createKeys(),
}
