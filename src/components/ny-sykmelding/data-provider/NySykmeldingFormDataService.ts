export type NotAvailable = typeof NotAvailable
export const NotAvailable = {
    type: 'resource-not-available',
} as const

export type PatientInfo = {
    oid: {
        type: 'fødselsnummer' | 'd-nummer' | 'annet nummer'
        nr: string
    }
    navn: string
}

export type ArbeidsgiverInfo = {
    navn: string
    organisasjonsnummer: string
}

export type NySykmeldingFormDataService = {
    context: {
        pasient: (() => Promise<PatientInfo>) | NotAvailable
        arbeidsgivere: (() => Promise<ArbeidsgiverInfo[]>) | NotAvailable
    }
    query: {
        pasient: ((fnr: string) => Promise<PatientInfo>) | NotAvailable
    }
}

export function isResourceAvailable<Resource>(resource: Resource | NotAvailable): resource is Resource {
    return !(
        resource != null &&
        typeof resource === 'object' &&
        'type' in resource &&
        resource.type === 'resource-not-available'
    )
}

export function assertResourceAvailable<Resource>(resource: Resource | NotAvailable): asserts resource is Resource {
    if (!isResourceAvailable(resource)) {
        throw new ResourceNotAvailable()
    }
}

export class ResourceNotAvailable extends Error {
    constructor() {
        super('Resource is not available')
    }
}
