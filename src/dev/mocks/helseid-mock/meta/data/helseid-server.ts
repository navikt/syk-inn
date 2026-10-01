import { getConfig } from '../../config'

import { createKeys } from './keys'
import { createWellKnown } from './well-known'

export const helseIdServerMeta = {
    wellKnown: () => {
        const config = getConfig()

        return createWellKnown(`${config.baseUrl}${config.helseIdPath ?? ''}`)
    },
    keys: () => createKeys(),
}
