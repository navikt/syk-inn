import { z } from 'zod'

export type InitialSession = z.infer<typeof InitialSessionSchema>
export const InitialSessionSchema = z.object({
    issuer: z.string(),
    authorizationEndpoint: z.string(),
    tokenEndpoint: z.string(),
    codeVerifier: z.string(),
    state: z.string(),
})

export type CompleteSession = z.infer<typeof CompleteSessionSchema>
export const CompleteSessionSchema = InitialSessionSchema.extend({
    accessToken: z.string(),
    idToken: z.string(),
    patient: z.string(),
    encounter: z.string(),
    // webmedPractitioner?: string
})
