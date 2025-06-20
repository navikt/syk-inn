import {
    FhirBundle,
    FhirCondition,
    FhirEncounter,
    FhirPatient,
    FhirOrganization,
    FhirDocumentReferenceBase,
    FhirPractitioner,
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
