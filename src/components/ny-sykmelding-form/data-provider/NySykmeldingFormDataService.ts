export type NotAvailable = typeof NotAvailable
export const NotAvailable = {
    type: 'resource-not-available',
} as const

/**
 * This interface normalizes the data available to the form to create new sykmeldinger. Any context (fhir/standalone)
 * will provide an implementation of this interface, describing how the data should be fetched, or if it's not available.
 *
 * The form will be able to conditionally render pre-filled fields or interactive inputs based on whether or not the data
 * is fetchable.
 */
export type NySykmeldingFormDataService = {
    /**
     * Contextually available data will be fetched without any arguments, and is based on the current session.
     */
    context: {
        pasient: (() => Promise<PatientInfo>) | NotAvailable
        arbeidsgivere: (() => Promise<ArbeidsgiverInfo[]>) | NotAvailable
        bruker: (() => Promise<BrukerInfo>) | NotAvailable
    }
    /**
     * Query data can be anything that requires an argument to fetch, such as a specific patient.
     */
    query: {
        pasient: ((fnr: string) => Promise<PatientInfo>) | NotAvailable
    }
}

export type PatientInfo = {
    oid: {
        type: 'fødselsnummer' | 'd-nummer' | 'annet nummer'
        nr: string
    } | null
    navn: string
}

export type ArbeidsgiverInfo = {
    navn: string
    organisasjonsnummer: string
}

export type BrukerInfo = {
    navn: string
    epjDescription: string
}

/**
 * Type guard to check if a resource (i.e. a data service function) is available or not. Used to conditionally render
 * the form based on whether the data is configured to be available.
 */
export function isResourceAvailable<Resource>(resource: Resource | NotAvailable): resource is Resource {
    return !(
        resource != null &&
        typeof resource === 'object' &&
        'type' in resource &&
        resource.type === 'resource-not-available'
    )
}

/**
 * Assertion to be used for type coercing data service functions. Should only be used below a `isResourceAvailable`-condition.
 */
export function assertResourceAvailable<Resource>(resource: Resource | NotAvailable): asserts resource is Resource {
    if (!isResourceAvailable(resource)) {
        throw new Error('Resource is not available')
    }
}
