import * as z from 'zod/v4'
import { logger } from '@navikt/next-logger'

export type DraftValues = z.infer<typeof DraftValuesSchema>
export const DraftValuesSchema = z.object({
    arbeidsforhold: z
        .object({
            harFlereArbeidsforhold: z.enum(['JA', 'NEI']).nullable(),
            sykmeldtFraArbeidsforhold: z.string().nullable(),
        })
        .nullable(),
    perioder: z
        .array(
            z.object({
                type: z.enum(['GRADERT', 'AKTIVITET_IKKE_MULIG']),
                fom: z.string().nullable(),
                tom: z.string().nullable(),
                grad: z.string().nullable().optional(),
            }),
        )
        .nullable(),
    hoveddiagnose: z
        .object({
            system: z.enum(['ICD10', 'ICPC2']),
            code: z.string(),
            text: z.string(),
        })
        .nullable(),
    tilbakedatering: z
        .object({
            fom: z.string().nullable(),
            grunn: z.string().nullable(),
        })
        .nullable(),
    meldinger: z
        .object({
            showTilNav: z.boolean(),
            tilNav: z.string().nullable(),
            showTilArbeidsgiver: z.boolean(),
            tilArbeidsgiver: z.string().nullable(),
        })
        .nullable(),
    svangerskapsrelatert: z.boolean().nullable(),
    yrkesskade: z
        .object({
            yrkesskade: z.boolean(),
            skadedato: z.string().nullable(),
        })
        .nullable(),
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
