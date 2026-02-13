import * as z from 'zod'

export type InSituFeedbackPayload = z.infer<typeof inSituFeedbackPayloadSchema>
export const inSituFeedbackPayloadSchema = z.object({
    feedbackType: z.literal('IN_SITU'),
    message: z.string(),
    sentiment: z.coerce.number().int().min(1).max(5).nullable(),
    variant: z.enum(['Kvittering']),
    meta: z.object({
        location: z.string(),
        dev: z.record(z.string(), z.string().nullish()),
    }),
})

export type FullFeedbackPayload = z.infer<typeof fullFeedbackPayloadSchema>
export const fullFeedbackPayloadSchema = z.object({
    feedbackType: z.literal('FULL'),
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
    feedbackType: z.literal('SENTIMENT_UPDATE'),
    id: z.string(),
    sentiment: z.coerce.number().int().min(1).max(5),
})
