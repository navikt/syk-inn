import * as z from 'zod'

import { DateTime, NullableDateTime, NullableValkeyString, SentimentSchema } from './common'
import { MetaDevSchema, MetaTagsSchema, RedactionLogSchema } from './meta-schema'

const SentimentableSchema = z.object({
    sentiment: SentimentSchema,
})

const BaseFeedbackSchema = z.object({
    id: z.string(),
    timestamp: DateTime,
    /**
     * Metadata used for storing the administrative state of the feedback
     */
    contactedAt: NullableDateTime,
    contactedBy: NullableValkeyString,
    verifiedContentAt: NullableDateTime,
    verifiedContentBy: NullableValkeyString,
    sharedAt: NullableDateTime,
    sharedBy: NullableValkeyString,
    sharedLink: NullableValkeyString,
    /**
     * Metadata used for audit logging of redactions
     */
    redactionLog: RedactionLogSchema,
    /**
     * Current path of the user, only pathname, no URL or query params.
     */
    metaLocation: z.string().nonempty().nullable(),
    /**
     * The system, e.g. which EHR system the feedback was provided through
     */
    metaSystem: z.string().nonempty(),
    /**
     * Future proofing: If multiple apps are to use zara, we need this.
     */
    metaSource: z.literal('syk-inn'),
    /**
     * Tags are used to categorize feedback.
     */
    metaTags: MetaTagsSchema,
    /**
     * A generic record used for non-structured metadata used for debugging.
     */
    metaDev: MetaDevSchema,
})

/**
 * The types of supported contact methods for feedback follow-up.
 */
export const ContactTypeSchema = z.enum(['PHONE', 'EMAIL', 'NONE'])

export type ContactableUserFeedback = z.infer<typeof ContactableUserFeedbackSchema>
export const ContactableUserFeedbackSchema = BaseFeedbackSchema.safeExtend(SentimentableSchema.shape).safeExtend({
    type: z.literal('CONTACTABLE'),
    name: z.string().nonempty(),
    uid: z.string().nonempty(),
    message: z.string().nonempty(),
    category: z.enum(['FEIL', 'FORSLAG', 'ANNET']),
    contactType: ContactTypeSchema,
    contactDetails: NullableValkeyString,
})

export type InSituFeedback = z.infer<typeof ContactableUserFeedbackSchema>
export const InSituFeedbackSchema = BaseFeedbackSchema.safeExtend(SentimentableSchema.shape).safeExtend({
    type: z.literal('IN_SITU'),
    name: z.string().nonempty(),
    uid: z.string().nonempty(),
    message: z.string().nonempty(),
})

export type AllFeedbackTypes = z.infer<typeof AllFeedbackTypesSchema>
export const AllFeedbackTypesSchema = z.discriminatedUnion('type', [
    ContactableUserFeedbackSchema,
    InSituFeedbackSchema,
])
