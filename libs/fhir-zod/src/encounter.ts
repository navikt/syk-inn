import { z } from 'zod/v4'

import { CobeableConceptSchema, ReferenceSchema } from './common'

export type FhirEncounterDiagnosis = z.infer<typeof FhirEncounterDiagnosisSchema>
export const FhirEncounterDiagnosisSchema = z.object({
    condition: ReferenceSchema,
    rank: z.number().optional(),
})

export type FhirEncounter = z.infer<typeof FhirEncounterSchema>
export const FhirEncounterSchema = z.object({
    resourceType: z.literal('Encounter'),
    id: z.string(),
    status: z.string(),
    diagnosis: z.array(FhirEncounterDiagnosisSchema).optional(),
    reasonCode: z
        .array(
            z.object({
                coding: z.array(CobeableConceptSchema),
            }),
        )
        .optional(),
    serviceProvider: ReferenceSchema,
})
