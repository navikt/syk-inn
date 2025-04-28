import { z } from 'zod'

import { CobeableConceptSchema } from './common'

export type FhirCondition = z.infer<typeof FhirConditionSchema>
export const FhirConditionSchema = z.object({
    resourceType: z.literal('Condition'),
    id: z.string(),
    subject: z.object({ type: z.literal('Patient'), reference: z.string() }),
    code: z.object({
        coding: z.array(CobeableConceptSchema),
    }),
})
