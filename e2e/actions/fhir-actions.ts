import { test, Page } from '@playwright/test'

import { Scenarios } from '../../src/data-layer/mock-engine/scenarios/scenarios'

const launchUrl = `/fhir/launch?iss=http://localhost:3000/api/mocks/fhir&launch=foo-bar-launch`

export function launchWithMock(scenario: Scenarios = 'normal') {
    return async (page: Page): Promise<void> => {
        if (scenario != 'normal') {
            return test.step(`Launch scenario ${scenario}`, async () => {
                await page.goto(`/set-scenario/${scenario}?returnTo=${encodeURIComponent(launchUrl)}`)
            })
        }

        return test.step('Launch FHIR mock with default scenario (normal)', async () => {
            await page.goto(launchUrl)
        })
    }
}
