import * as z from 'zod'

export const HelseIdClaimSchema = z.object({
    access_token: z.string(),
    issuer: z.string(),
    scope: z.string(),
})
