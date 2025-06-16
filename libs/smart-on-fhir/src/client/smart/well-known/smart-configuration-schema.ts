import * as z from 'zod/v4'

export type SmartConfiguration = z.infer<typeof SmartConfigurationSchema>
export const SmartConfigurationSchema = z.object({
    issuer: z.string(),
    jwks_uri: z.string(),
    authorization_endpoint: z.string(),
    token_endpoint: z.string(),
})
