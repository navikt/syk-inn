import * as z from 'zod/v4'
import {
    createFhirBundleSchema,
    FhirBundle,
    FhirCondition,
    FhirConditionSchema,
    FhirDocumentReferenceBase,
    FhirDocumentReferenceBaseSchema,
    FhirEncounter,
    FhirEncounterSchema,
    FhirOrganization,
    FhirOrganizationSchema,
    FhirPatient,
    FhirPatientSchema,
    FhirPractitioner,
    FhirPractitionerSchema,
} from '@navikt/fhir-zod'

/**
 * A map of FHIR paths in a FHIR server and their known corresponding resource types.
 */
type ResourceMap = {
    '/Condition?': FhirBundle<FhirCondition>
    '/Encounter/': FhirEncounter
    '/Patient/': FhirPatient
    '/Organization/': FhirOrganization
    '/DocumentReference/': FhirDocumentReferenceBase
    '/Practitioner/': FhirPractitioner
}

/**
 * All known paths based on keys in the resource map.
 *
 * For now the type only supports resource paths that end with a distinct ID or
 * query parameters, such as `/Condition?` or `/Encounter/`. If we ever need to
 * query the FHIR server directly this type will need to be smarter.
 */
export type KnownPaths = `${keyof ResourceMap}${string}`

/**
 * Looks up the correct FHIR type for a given path.
 */
export type ResponseFor<T extends string> = {
    [K in keyof ResourceMap]: T extends `${K}${string}` ? ResourceMap[K] : never
}[keyof ResourceMap]

/**
 * Converts from a KnownPath to the actual FHIR zod schema for this resource.
 *
 * This function is a type-hole, the callee will have to as the resulting parsed schema to the correct type.
 */
export function resourceToSchema(resource: KnownPaths): z.ZodObject {
    if (resource.startsWith('/Practitioner/')) {
        return FhirPractitionerSchema
    } else if (resource.startsWith('/DocumentReference/')) {
        return FhirDocumentReferenceBaseSchema
    } else if (resource.startsWith('/Patient/')) {
        return FhirPatientSchema
    } else if (resource.startsWith('/Encounter/')) {
        return FhirEncounterSchema
    } else if (resource.startsWith('/Condition?')) {
        return createFhirBundleSchema(FhirConditionSchema)
    } else if (resource.startsWith('/Organization')) {
        return FhirOrganizationSchema
    }

    throw new Error(`Unknown resource type (or not implemented): ${resource}`)
}
