export type ModeType = 'FHIR' | 'HelseID'

export type ModePaths = {
    graphql: `/${string}`
    root: `/${string}` | '/'
    ny: `/${string}`
    utkast: (id: string) => `/${string}`
    sykmelding: (id: string) => `/${string}`
    dupliser: (id: string) => `/${string}`
    forleng: (id: string) => `/${string}`
    kvittering: (id: string) => `/${string}`
    pdf: (id: string) => `/${string}`
}

export const createFhirPaths = (patientId: string): ModePaths => ({
    root: `/fhir/${patientId}`,
    graphql: `/fhir/${patientId}/graphql`,
    ny: `/fhir/${patientId}/ny`,
    utkast: (id) => `/fhir/${patientId}/draft/${id}`,
    sykmelding: (id) => `/fhir/${patientId}/sykmelding/${id}`,
    dupliser: (id) => `/fhir/${patientId}/dupliser/${id}`,
    forleng: (id) => `/fhir/${patientId}/forleng/${id}`,
    kvittering: (id) => `/fhir/${patientId}/kvittering/${id}`,
    pdf: (id) => `/fhir/${patientId}/pdf/${id}`,
})

export const HelseIdPaths: ModePaths = {
    root: '/',
    graphql: '/graphql',
    ny: '/ny',
    utkast: (id) => `/draft/${id}`,
    sykmelding: (id) => `/sykmelding/${id}`,
    dupliser: (id) => `/dupliser/${id}`,
    forleng: (id) => `/forleng/${id}`,
    kvittering: (id) => `/kvittering/${id}`,
    pdf: (id) => `/pdf/${id}`,
}
