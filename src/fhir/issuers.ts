import { isLocalOrDemo } from '@utils/env'

export const knownIssuers: string[] = ['https://launch.smarthealthit.org/v/r4/fhir']

if (isLocalOrDemo) {
    knownIssuers.push('http://localhost:3000/api/fhir-mock')
}
