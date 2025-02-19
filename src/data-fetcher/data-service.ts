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
        behandler: BehandlerInfo
        pasient: (() => Promise<PasientInfo>) | NotAvailable
        arbeidsgivere: (() => Promise<ArbeidsgiverInfo[]>) | NotAvailable
        konsultasjon: (() => Promise<KonsultasjonInfo>) | NotAvailable
    }
    /**
     * Query data can be anything that requires an argument to fetch, such as a specific patient.
     */
    query: {
        pasient: ((ident: string) => Promise<PasientQueryInfo>) | NotAvailable
        sykmelding: (id: string) => Promise<ExistingSykmelding>
    }
    mutation: {
        sendSykmelding: (sykmelding: unknown) => Promise<NySykmelding>
    }
}

export type PasientInfo = {
    ident: string
    navn: string
    fastlege: {
        navn: string
        hpr: string
    } | null
}

export type PasientQueryInfo = {
    ident: string | null
    navn: string
}

export type KonsultasjonInfo = {
    diagnoser: {
        system: 'ICD10' | 'ICPC2'
        kode: string
        tekst: string
        vekt?: number
    }[]
    diagnose: {
        system: 'ICD10' | 'ICPC2'
        kode: string
        tekst: string
    } | null
}

export type ArbeidsgiverInfo = {
    navn: string
    organisasjonsnummer: string
}

export type Autorisasjoner = Array<{
    kategori: {
        system: 'urn:oid:2.16.578.1.12.4.1.1.9060'
        code: string
        display: string
    }
    autorisasjon: {
        system: 'urn:oid:2.16.578.1.12.4.1.1.7704'
        code: string
        display: string
    } | null
    spesialisering: {
        system: 'urn:oid:2.16.578.1.12.4.1.1.7426'
        code: string
        display: string
    } | null
}>

export type BehandlerInfo = {
    navn: string
    hpr: string
    epjDescription?: string
    autorisasjoner: Autorisasjoner
}

export type NySykmelding = {
    sykmeldingId: string
}

export type ExistingSykmelding = {
    sykmeldingId: string
    periode: {
        fom: string
        tom: string
    }
    pasient: {
        fnr: string
    }
    hovedDiagnose: {
        system: string
        code: string
        text: string
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
