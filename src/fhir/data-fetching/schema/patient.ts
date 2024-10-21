import { z } from 'zod'

import { NameSchema } from './common'

export type FhirPatient = z.infer<typeof FhirPatientSchema>
export const FhirPatientSchema = z.object({
    resourceType: z.literal('Patient'),
    identifier: z.array(z.object({ system: z.string(), value: z.string() })).optional(),
    name: NameSchema,
})

/**
 * TODO: Does this need to be supported?
 */
export type FhirBundle = z.infer<typeof FhirBundleSchema>
export const FhirBundleSchema = z.object({
    resourceType: z.literal('Bundle'),
    entry: z.array(z.object({ resource: FhirPatientSchema })),
})

export const FhirBundleOrPatientSchema = z.union([FhirBundleSchema, FhirPatientSchema])
