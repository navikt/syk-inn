import * as z from 'zod'
import { formatISO, parseISO } from 'date-fns'

export const ContactTypeSchema = z.enum(['PHONE', 'EMAIL', 'NONE'])

export const NullableValkeyString = z.string().transform((it) => (it.trim() === '' ? null : it))

export const NullableDateTime = z.string().transform((date) => {
    if (date == null || date.trim() === '') return null

    return formatISO(parseISO(date))
})

export const DateTime = z.string().transform((date) => formatISO(parseISO(date)))

export type Feedback = z.infer<typeof FeedbackSchema>
export const FeedbackSchema = z.object({
    id: z.string(),
    name: z.string().nonempty(),
    uid: z.string().nonempty(),
    message: z.string().nonempty(),
    timestamp: DateTime,
    sentiment: NullableValkeyString.transform((val) => (val == null ? null : Number(val))).pipe(
        z.number().min(1).max(5).nullable(),
    ),
    category: z.enum(['FEIL', 'FORSLAG', 'ANNET']),
    contactType: ContactTypeSchema,
    contactDetails: NullableValkeyString,
    contactedAt: NullableDateTime,
    contactedBy: NullableValkeyString,
    verifiedContentAt: NullableDateTime,
    verifiedContentBy: NullableValkeyString,
    redactionLog: z
        .string()
        .nullable()
        .transform((val, ctx) => {
            if (val == null) return []

            try {
                return JSON.parse(val)
            } catch {
                ctx.addIssue({ code: 'custom', message: 'Invalid JSON' })
                return z.NEVER
            }
        })
        .pipe(
            z.array(
                z.object({
                    name: z.string(),
                    count: z.number(),
                    timestamp: DateTime,
                }),
            ),
        ),
    metaSource: z.literal('syk-inn'),
    /**
     * Current path of the user, only pathname, no URL or query params.
     */
    metaLocation: z.string().nonempty().nullable(),
    /**
     * The system, e.g. which EHR system the feedback was provided through
     */
    metaSystem: z.string().nonempty(),
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
