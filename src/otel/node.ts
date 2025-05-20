import { trace, context } from '@opentelemetry/api'

import { IsomorphicOTEL } from './common'

export function getNodeOTEL(): IsomorphicOTEL {
    return {
        trace,
        context,
    }
}
