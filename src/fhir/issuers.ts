import { isLocalOrDemo } from '@utils/env'

/**
 * Should be provided by an external configuration or self-service system. But for now we'll hardcode the trusted issuers.
 */
export const knownIssuers: string[] = ['https://launch.smarthealthit.org/v/r4/fhir']

if (isLocalOrDemo) {
    knownIssuers.push('http://localhost:3000/api/fhir-mock')
}
