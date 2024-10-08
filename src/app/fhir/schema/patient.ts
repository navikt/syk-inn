import { z } from 'zod'

export type FhirPatient = z.infer<typeof FhirPatientSchema>
export const FhirPatientSchema = z.object({
    resourceType: z.literal('Patient'),
    identifier: z.array(z.object({ system: z.string(), value: z.string() })),
    name: z.array(z.object({ family: z.string(), given: z.array(z.string()) })),
})

export type FhirBundle = z.infer<typeof FhirBundleSchema>
export const FhirBundleSchema = z.object({
    resourceType: z.literal('Bundle'),
    entry: z.array(z.object({ resource: FhirPatientSchema })),
})

export const FhirBundleOrPatientSchema = z.union([FhirBundleSchema, FhirPatientSchema])
