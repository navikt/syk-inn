import * as z from 'zod'

export type FullFeedbackPayload = z.infer<typeof fullFeedbackPayloadSchema>
export const fullFeedbackPayloadSchema = z.object({
    type: z.enum(['FEIL', 'FORSLAG', 'ANNET']),
    message: z.string(),
    contact: z.object({
        type: z.enum(['NONE', 'EMAIL', 'PHONE']),
        details: z.string().nullable(),
    }),
    meta: z.object({
        location: z.string(),
        dev: z.record(z.string(), z.string().nullish()),
    }),
})

export type FeedbackUpdateSentimentPayload = z.infer<typeof feedbackUpdateSentimmentPayloadSchema>
export const feedbackUpdateSentimmentPayloadSchema = z.object({
    id: z.string(),
    sentiment: z.coerce.number().int().min(1).max(5),
})
