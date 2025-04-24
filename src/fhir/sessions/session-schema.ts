import { z } from 'zod'

export type WellKnown = z.infer<typeof WellKnownSchema>
export const WellKnownSchema = z.object({
    issuer: z.string(),
    jwks_uri: z.string(),
    authorization_endpoint: z.string(),
    token_endpoint: z.string(),
})

export type TokenResponse = z.infer<typeof TokenResponseSchema>
export const TokenResponseSchema = z.object({
    // OIDC:
    access_token: z.string(),
    id_token: z.string(),
    // SMART:
    patient: z.string(),
    encounter: z.string(),
})
