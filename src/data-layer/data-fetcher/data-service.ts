import { SubmitSykmeldingFormValues } from '@services/syk-inn-api/SykInnApiSchema'
import {
    Behandler,
    CreatedSykmelding,
    Konsultasjon,
    Pasient,
    PersonQueryInfo,
    Sykmelding,
    SynchronizationStatus,
} from '@data-layer/resources'

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
export type DataService = {
    /**
     * Used for certain specific behaviour, such as which route to navigate after submitting the form.
     */
    mode: 'fhir' | 'standalone'
    /**
     * Contextually available data will be fetched without any arguments, and is based on the current session.
     */
    context: {
        behandler: Behandler
        pasient: (() => Promise<Pasient>) | NotAvailable
        konsultasjon: (() => Promise<Konsultasjon>) | NotAvailable
    }
    /**
     * Query data can be anything that requires an argument to fetch, such as a specific patient.
     */
    query: {
        pasient: ((ident: string) => Promise<PersonQueryInfo>) | NotAvailable
        sykmelding: (id: string) => Promise<Sykmelding>
    }
    mutation: {
        sendSykmelding: (sykmelding: SubmitSykmeldingFormValues) => Promise<CreatedSykmelding>
        synchronize: (sykmeldingId: string) => Promise<SynchronizationStatus>
    }
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
        throw new Error(`Resource is not available`)
    }
}
