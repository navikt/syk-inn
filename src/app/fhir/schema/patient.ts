import { z } from 'zod'

export type FhirPatient = z.infer<typeof FhirPatientSchema>
export const FhirPatientSchema = z.object({
    identifier: z.array(z.object({ system: z.string(), value: z.string() })),
    name: z.array(z.object({ family: z.string(), given: z.array(z.string()) })),
})
