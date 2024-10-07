export type NotAvailable = typeof NotAvailable
export const NotAvailable = {
    type: 'resource-not-available',
} as const

export type PatientInfo = {
    fnr: string
    navn: string
}

export type NySykmeldingFormDataService = {
    context: {
        getPasient: (() => Promise<PatientInfo>) | NotAvailable
    }
    query: {
        getPasientByFnr: ((fnr: string) => Promise<PatientInfo>) | NotAvailable
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
