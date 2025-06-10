import { z } from 'zod/v4'

export type InitialSession = z.infer<typeof InitialSessionSchema>
export const InitialSessionSchema = z.object({
    server: z.string(),
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
    // TODO: Temporary hack
    webmedPractitioner: z.string().optional(),
})
