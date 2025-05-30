import { bundledEnv } from '@utils/env'

export const knownIssuers: Record<string, { issuers: string[] }> = {
    'https://launch.smarthealthit.org/v/r4/fhir': {
        issuers: [],
    },
    'https://fhir.ekstern.dev.nav.no': {
        issuers: [],
    },
    'https://fhir-api-auth.public.webmedepj.no': {
        issuers: ['https://authority.public.webmedepj.no'],
    },
}

switch (bundledEnv.NEXT_PUBLIC_RUNTIME_ENV) {
    case 'local':
    case 'e2e':
        knownIssuers['http://localhost:3000/api/mocks/fhir'] = { issuers: [] }
        break
    case 'demo':
        knownIssuers['https://syk-inn.ekstern.dev.nav.no/samarbeidspartner/sykmelding/api/mocks/fhir'] = { issuers: [] }
        break
    case 'dev-gcp':
    case 'prod-gcp':
        break
}

/**
 * Should be provided by an external configuration or self-service system. But for now we'll hardcode the trusted issuers.
 */
export const knownFhirServers: string[] = Object.keys(knownIssuers)

export function isKnownFhirServer(iss: string): boolean {
    const [withoutQuery] = iss.split('?')
    const withoutTrailingSlash = removeTrailingSlash(withoutQuery)

    return knownFhirServers.map((it) => it.replace(/\/$/, '')).includes(withoutTrailingSlash)
}

export function removeTrailingSlash(url: string): string {
    return url.replace(/\/$/, '')
}
