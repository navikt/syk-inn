import { test, Page } from '@playwright/test'

import { ExpectedToggles } from '@core/toggles/toggles'

import { Scenarios } from '../../src/dev/mock-engine/scenarios/scenarios'

export const launchPath = '/fhir/launch'

const launchUrl = `${launchPath}?iss=http://localhost:3000/api/mocks/fhir&launch=foo-bar-launch`

export function launchWithMock(
    scenario: Scenarios = 'normal',
    toggleOverrides: Partial<Record<ExpectedToggles, boolean>> = {
        SYK_INN_AAREG: false,
        SYK_INN_SHOW_REDACTED: false,
        SYK_INN_AUTO_BIDIAGNOSER: false,
    },
) {
    return async (page: Page): Promise<void> => {
        if (Object.keys(toggleOverrides).length > 0) {
            await test.step(`Override feature toggles:\n${Object.entries(toggleOverrides)
                .map(([toggle, state]) => ` - ${toggle}: ${state}`)
                .join('\n')}`, async () => {
                await page.context().addCookies(
                    Object.entries(toggleOverrides).map(([name, value]) => ({
                        name,
                        value: value ? 'true' : 'false',
                        domain: 'localhost',
                        path: '/',
                    })),
                )
            })
        }

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
