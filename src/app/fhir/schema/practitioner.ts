import { z } from 'zod'

import { NameSchema } from './common'

export type FhirPractitioner = z.infer<typeof FhirPractitionerSchema>
export const FhirPractitionerSchema = z.object({
    resourceType: z.literal('Practitioner'),
    name: NameSchema,
})
