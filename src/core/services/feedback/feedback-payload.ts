import * as z from 'zod'

export type FeedbackPayload = z.infer<typeof feedbackPayloadSchema>
export const feedbackPayloadSchema = z.object({
    type: z.enum(['FEIL', 'FORSLAG', 'ANNET']),
    message: z.string(),
    sentiment: z.coerce.number().int().min(1).max(5).nullable(),
    contact: z.object({
        type: z.enum(['NONE', 'EMAIL', 'PHONE']),
        details: z.string().nullable(),
    }),
    meta: z.object({
        location: z.string(),
        dev: z.record(z.string(), z.string().nullish()),
    }),
})
