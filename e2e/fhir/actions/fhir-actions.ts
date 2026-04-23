import { test, Page } from '@playwright/test'
import { MockLaunchType, MockOrganizations, MockPatients, MockPractitioners } from '@navikt/fhir-mock-server/types'
import { Scenarios } from '@dev/mock-engine/scenarios/scenarios'
import { WELCOME_MODAL_LOCAL_STORAGE_KEY } from '@features/fhir/dashboard/welcome-modal/state'

import { applyToggleOverrides, ToggleOverrides } from '../../actions/toggle-overrides'

export const launchPath = '/fhir/launch'

const launchUrl = `${launchPath}?iss=http://localhost:3000/api/mocks/fhir`

type AdditionalOptions =
    | {
          patient?: MockPatients
          practitioner?: null
          organization?: null
      }
    | {
          patient: MockPatients
          practitioner?: MockPractitioners
          organization?: null
      }
    | {
          patient: MockPatients
          practitioner: MockPractitioners
          organization: MockOrganizations
      }

export function launchWithMock(
    scenario: Scenarios = 'normal',
    {
        patient = 'Espen Eksempel',
        practitioner = null,
        organization = null,
        skipWelcomeModal = true,
        ...toggleOverrides
    }: ToggleOverrides & AdditionalOptions & { skipWelcomeModal?: boolean } = {
        patient: 'Espen Eksempel',
        skipWelcomeModal: true,
    },
) {
    const actualToggleOverrides = {
        SYK_INN_AAREG: false,
        SYK_INN_SHOW_REDACTED: false,
        SYK_INN_AUTO_BIDIAGNOSER: false,
        ...toggleOverrides,
    }
    return async (page: Page): Promise<void> => {
        if (Object.keys(actualToggleOverrides).length > 0) {
            await applyToggleOverrides(page, actualToggleOverrides)
        }

        if (scenario != 'normal') {
            await test.step(`Launch scenario ${scenario} (${patient})`, async () => {
                await page.goto(
                    `/dev/set-scenario/${scenario}?returnTo=${encodeURIComponent(`${launchUrl}&launch=${buildLaunchParam(patient, practitioner, organization)}`)}`,
                )
            })
        } else {
            await test.step(`Launch FHIR mock with default scenario (normal, ${patient})`, async () => {
                await page.goto(`${launchUrl}&launch=${buildLaunchParam(patient, practitioner, organization)}`)
            })
        }

        if (skipWelcomeModal) {
            await test.step('Set welcome modal localStorage state', async () => {
                await page.evaluate((key) => localStorage.setItem(key, 'true'), WELCOME_MODAL_LOCAL_STORAGE_KEY)
            })
        }
    }
}

function buildLaunchParam(
    patient: MockPatients,
    practitioner: MockPractitioners | null,
    organization: MockOrganizations | null,
): MockLaunchType {
    let launch = `local-dev-launch:${patient}`
    if (practitioner) launch += `:${practitioner}`
    if (organization) launch += `:${organization}`
    return launch as MockLaunchType
}
