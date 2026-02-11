import * as z from 'zod'

import { DateTime } from './common'

export const RedactionLogSchema = z
    .string()
    .nullable()
    .transform((val, ctx) => {
        if (val == null) return []

        try {
            return JSON.parse(val)
        } catch {
            ctx.addIssue({ code: 'custom', message: 'Invalid JSON' })
            return z.NEVER
        }
    })
    .pipe(
        z.array(
            z.object({
                name: z.string(),
                count: z.number(),
                timestamp: DateTime,
            }),
        ),
    )
