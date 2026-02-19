import * as z from 'zod'

import { DateTime } from '../lib/zod'

export type Bruksvilkar = z.infer<typeof BruksvilkarValkeySchema>
export const BruksvilkarValkeySchema = z.object({
    acceptedAt: DateTime,
    name: z.string(),
    hpr: z.string(),
    org: z.string(),
    version: z.string(),
    system: z.string(),
    hash: z.string(),
    tokenValid: z.stringbool(),
})
