import { z } from 'zod/v4'
import { logger } from '@navikt/next-logger'

export type DraftValues = z.infer<typeof DraftValuesSchema>
export const DraftValuesSchema = z.object({
    perioder: z
        .array(
            z.object({
                type: z.enum(['GRADERT', 'AKTIVITET_IKKE_MULIG']),
                fom: z.string().nullable(),
                tom: z.string().nullable(),
                grad: z.number().nullable().optional(),
            }),
        )
        .optional(),
})

/**
 * The draft blob can be stale or broken, this will not throw in the draft is broken.
 */
export function safeParseDraft(
    draftId: string | null | undefined,
    potentialDraft: unknown | undefined,
): DraftValues | null {
    if (potentialDraft == null) return null

    const result = DraftValuesSchema.safeParse(potentialDraft)
    if (result.success) {
        return result.data
    } else {
        logger.error(
            new Error(`Tried to parse draft, but got invalid data, id: ${draftId ?? 'null'}`, {
                cause: result.error,
            }),
        )
        return null
    }
}
