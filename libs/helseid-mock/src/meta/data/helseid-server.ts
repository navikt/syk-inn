import { getConfig } from '../../config'

import { createWellKnown } from './well-known'

export const helseIdServerMeta = {
    wellKnown: () => {
        const config = getConfig()

        return createWellKnown(`${config.baseUrl}${config.helseIdPath ?? ''}`)
    },
}
