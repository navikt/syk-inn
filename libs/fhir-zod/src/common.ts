import { z } from 'zod'

export type Name = z.infer<typeof NameSchema>
export const NameSchema = z.array(z.object({ family: z.string(), given: z.array(z.string()) }))

export type GeneralIdentifier = z.infer<typeof GeneralIdentifierSchema>
export const GeneralIdentifierSchema = z.object({ system: z.string(), value: z.string() })

export type CodeableConcept = z.infer<typeof CobeableConceptSchema>
export const CobeableConceptSchema = z.object({ system: z.string(), display: z.string(), code: z.string() })

export type Reference = z.infer<typeof ReferenceSchema>
export const ReferenceSchema = z.object({ type: z.string().optional(), reference: z.string() })
