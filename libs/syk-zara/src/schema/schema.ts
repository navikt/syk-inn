import * as z from 'zod'

import { DateTime, NullableDateTime, NullableValkeyString } from './common'
import { RedactionLogSchema } from './meta-schema'

/**
 * The types of supported contact methods for feedback follow-up.
 */
export const ContactTypeSchema = z.enum(['PHONE', 'EMAIL', 'NONE'])

/**
 * The sentiment is stored in valkey as nothing (''), or 1-5. This schema transforms it to a number or null.
 */
const SentimentSchema = NullableValkeyString.transform((val) => (val == null ? null : Number(val))).pipe(
    z.number().min(1).max(5).nullable(),
)

export type Feedback = z.infer<typeof FeedbackSchema>
export const FeedbackSchema = z.object({
    id: z.string(),
    name: z.string().nonempty(),
    uid: z.string().nonempty(),
    message: z.string().nonempty(),
    timestamp: DateTime,
    sentiment: SentimentSchema,
    category: z.enum(['FEIL', 'FORSLAG', 'ANNET']),
    /**
     * Metadata used for storing the administrative state of the feedback
     */
    contactType: ContactTypeSchema,
    contactDetails: NullableValkeyString,
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
    metaTags: z
        .string()
        .transform((val, ctx) => {
            try {
                return JSON.parse(val)
            } catch {
                ctx.addIssue({ code: 'custom', message: 'Invalid JSON' })
                return z.NEVER
            }
        })
        .pipe(z.array(z.string())),
    /**
     * A generic record used for non-structured metadata used for debugging.
     */
    metaDev: z
        .string()
        .transform((val, ctx) => {
            try {
                return JSON.parse(val)
            } catch {
                ctx.addIssue({ code: 'custom', message: 'Invalid JSON' })
                return z.NEVER
            }
        })
        .pipe(z.record(z.string(), z.string().nullable())),
})
