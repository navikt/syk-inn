import { z } from 'zod'

import { GeneralIdentifierSchema } from './common'

export type FhirOrganization = z.infer<typeof FhirOrganizationSchema>
export const FhirOrganizationSchema = z.object({
    resourceType: z.literal('Organization'),
    id: z.string(),
    identifier: z.array(GeneralIdentifierSchema),
    name: z.string(),
    telecom: z.array(z.object({ system: z.enum(['phone', 'email']), value: z.string() })),
})
