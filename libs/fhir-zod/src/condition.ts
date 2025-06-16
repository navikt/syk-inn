import * as z from 'zod/v4'

import { CobeableConceptSchema } from './common'

export type FhirCondition = z.infer<typeof FhirConditionSchema>
export const FhirConditionSchema = z.object({
    resourceType: z.literal('Condition'),
    id: z.string(),
    subject: z.object({ type: z.literal('Patient').optional(), reference: z.string() }),
    encounter: z.object({ type: z.literal('Encounter').optional(), reference: z.string() }),
    code: z.object({
        coding: z.array(CobeableConceptSchema),
    }),
})
