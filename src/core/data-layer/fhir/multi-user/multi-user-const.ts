/**
 * ← The header name of the current context patient that the SERVER tells the CLIENT about, using an
 * apollo-yoga plugin.
 */
export const MULTI_USER_CURRENT_CONTEXT_USER_HEADER = 'fhir-context-patient'

/**
 * → The header name of the stored (in session storage) active patient that the CLIENT
 * tells the SERVER about on every GQL request.
 */
export const MULTI_USER_ACTIVE_PATIENT_HEADER = 'FHIR-Active-Patient'

/**
 * Client side key in session storage where the active patient ID is stored.
 */
export const MULTI_USER_SESSION_STORAGE_KEY = 'FHIR_ACTIVE_PATIENT'
