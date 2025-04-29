import { z } from 'zod'

import { NameSchema, GeneralIdentifierSchema } from './common'

export type FhirPatient = z.infer<typeof FhirPatientSchema>
export const FhirPatientSchema = z.object({
    resourceType: z.literal('Patient'),
    identifier: z.array(GeneralIdentifierSchema).optional(),
    name: NameSchema,
    generalPractitioner: z.array(z.object({ identifier: GeneralIdentifierSchema, display: z.string() })).optional(),
})

/**
 * TODO: Does this need to be supported?
 */
export type FhirPatientBundle = z.infer<typeof FhirPatientBundleSchema>
export const FhirPatientBundleSchema = z.object({
    resourceType: z.literal('Bundle'),
    entry: z.array(z.object({ resource: FhirPatientSchema })),
})

export const FhirBundleOrPatientSchema = z.union([FhirPatientBundleSchema, FhirPatientSchema])
