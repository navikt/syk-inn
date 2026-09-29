import { MockLaunchType, MockOrganizations, MockPatients } from '@navikt/fhir-mock-server/types'

import { getAbsoluteURL, pathWithBasePath } from '#lib/url'

export const fhirLaunchUrl = `/fhir/launch?iss=${`${getAbsoluteURL()}/api/mocks/fhir`}` as const

export function createFhirScenarioUrl(
    scenario: string,
    patient: MockPatients,
    organization: MockOrganizations,
    frame: boolean,
): string {
    return pathWithBasePath(
        `/dev/set-scenario/${scenario}?returnTo=${encodeURIComponent(
            `${fhirLaunchUrl}&launch=${buildFhirLaunchParam(patient as MockPatients, organization, frame)}`,
        )}`,
    )
}

export function buildFhirLaunchParam(
    patient: MockPatients,
    organization: MockOrganizations,
    frame: boolean,
): MockLaunchType {
    return `local-dev-launch:${patient}:${organization}:${frame ? 'with-frame' : 'no-frame'}`
}

export function createHelseIDScenarioUrl(scenario: string): string {
    const helseIdMockUrl = `/api/mocks/helseid/dev/start-user${buildStandaloneInitParams()}`

    return pathWithBasePath(`/dev/set-scenario/${scenario}?returnTo=${encodeURIComponent(helseIdMockUrl)}`)
}

export function buildStandaloneInitParams(): string {
    return `?returnTo=${pathWithBasePath('/')}`
}
