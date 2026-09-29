import { MockLaunchType, MockOrganizations, MockPatients } from '@navikt/fhir-mock-server/types'
import { test, Page } from '@playwright/test'

import { Scenarios } from '#dev/mock-engine/scenarios/scenarios'

import { applyToggleOverrides, defaultE2EToggles, ToggleOverrides } from '../../actions/toggle-overrides'

export const launchPath = '/fhir/launch'

const launchUrl = `${launchPath}?iss=http://localhost:3000/api/mocks/fhir`

type AdditionalOptions =
    | {
          patient?: MockPatients
          organization?: null
      }
    | {
          patient: MockPatients
          organization?: null
      }
    | {
          patient: MockPatients
          organization: MockOrganizations
      }

export function launchWithMock(
    scenario: Scenarios = 'normal',
    { patient = 'Espen Eksempel', organization = null, ...toggleOverrides }: ToggleOverrides & AdditionalOptions = {
        patient: 'Espen Eksempel',
    },
) {
    const actualToggleOverrides: ToggleOverrides = {
        ...defaultE2EToggles,
        ...toggleOverrides,
    }
    return async (page: Page): Promise<void> => {
        if (Object.keys(actualToggleOverrides).length > 0) {
            await applyToggleOverrides(page, actualToggleOverrides)
        }

        if (scenario != 'normal') {
            await test.step(`Launch scenario ${scenario} (${patient})`, async () => {
                await page.goto(
                    `/dev/set-scenario/${scenario}?returnTo=${encodeURIComponent(`${launchUrl}&launch=${buildLaunchParam(patient, organization)}`)}`,
                )
            })
        } else {
            await test.step(`Launch FHIR mock with default scenario (normal, ${patient})`, async () => {
                await page.goto(`${launchUrl}&launch=${buildLaunchParam(patient, organization)}`)
            })
        }
    }
}

function buildLaunchParam(patient: MockPatients, organization: MockOrganizations | null): MockLaunchType {
    let launch = `local-dev-launch:${patient}`
    if (organization) launch += `:${organization}`
    return launch as MockLaunchType
}
