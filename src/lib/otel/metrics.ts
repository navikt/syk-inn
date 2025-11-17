import { metrics } from '@opentelemetry/api'

import { APP_NAME } from './common'

const meter = metrics.getMeter(APP_NAME)

const fhirLaunches = meter.createCounter('fhir_launches', {
    description: 'Number of launches in FHIR mode',
})

const nonPilotUserLaunchesCounter = meter.createCounter('non_pilot_user_launches', {
    description: 'Counts the number of launches by non-pilot users',
})

export function incrementNonPilotUserLaunch(hpr: string): void {
    nonPilotUserLaunchesCounter.add(1, { hpr })
}

export function incrementFhirLaunch(): void {
    fhirLaunches.add(1)
}
