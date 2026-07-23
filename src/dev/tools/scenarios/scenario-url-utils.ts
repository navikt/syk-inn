import { MockLaunchType, MockOrganizations, MockPatients, MockPractitioners } from '@navikt/fhir-mock-server/types'
import { MockBehandlere } from '@navikt/helseid-mock-server'

import { getAbsoluteURL, pathWithBasePath } from '#lib/url'

export const fhirLaunchUrl = `/fhir/launch?iss=${`${getAbsoluteURL()}/api/mocks/fhir`}` as const

export function createFhirScenarioUrl(
    scenario: string,
    patient: MockPatients,
    practitioner: MockPractitioners,
    organization: MockOrganizations,
    frame: boolean,
): string {
    return pathWithBasePath(
        `/dev/set-scenario/${scenario}?returnTo=${encodeURIComponent(
            `${fhirLaunchUrl}&launch=${buildFhirLaunchParam(patient as MockPatients, practitioner, organization, frame)}`,
        )}`,
    )
}

export function buildFhirLaunchParam(
    patient: MockPatients,
    practitioner: MockPractitioners,
    organization: MockOrganizations,
    frame: boolean,
): MockLaunchType {
    return `local-dev-launch:${patient}:${practitioner}:${organization}:${frame ? 'with-frame' : 'no-frame'}`
}

export function createHelseIDScenarioUrl(scenario: string, behandler: MockBehandlere): string {
    const helseIdMockUrl = `/api/mocks/helseid/dev/start-user${buildStandaloneInitParams(behandler as MockBehandlere)}`

    return pathWithBasePath(`/dev/set-scenario/${scenario}?returnTo=${encodeURIComponent(helseIdMockUrl)}`)
}

export function buildStandaloneInitParams(behandler: MockBehandlere): string {
    return `?user=${behandler}&returnTo=${pathWithBasePath('/')}`
}
