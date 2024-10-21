import { z } from 'zod'

export type Condition = z.infer<typeof ConditionSchema>
export const ConditionSchema = z.object({
    resourceType: z.literal('Condition'),
    clinicalStatus: z
        .object({
            coding: z.array(z.object({ system: z.string(), code: z.string() })),
        })
        .nullish(),
    code: z.object({
        text: z.string(),
        coding: z.array(
            z.object({
                code: z.string(),
                display: z.string(),
                system: z.string(),
            }),
        ),
    }),
    onsetDateTime: z.string(),
})
