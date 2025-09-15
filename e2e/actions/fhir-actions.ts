import { test, Page } from '@playwright/test'

import { ExpectedToggles } from '@core/toggles/toggles'
import { Scenarios } from '@dev/mock-engine/scenarios/scenarios'

export const launchPath = '/fhir/launch'

const launchUrl = `${launchPath}?iss=http://localhost:3000/api/mocks/fhir`

type ToggleOverrides = Partial<Record<ExpectedToggles, boolean>>

type AdditionalOptions = {
    patient?: 'espen' | 'kari'
}

export function launchWithMock(
    scenario: Scenarios = 'normal',
    { patient = 'espen', ...toggleOverrides }: ToggleOverrides & AdditionalOptions = {
        patient: 'espen',
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
            return test.step(`Launch scenario ${scenario} (${patient})`, async () => {
                await page.goto(
                    `/set-scenario/${scenario}?returnTo=${encodeURIComponent(`${launchUrl}&launch=local-dev-launch-${patient}`)}`,
                )
            })
        }

        return test.step(`Launch FHIR mock with default scenario (normal, ${patient})`, async () => {
            await page.goto(`${launchUrl}&launch=local-dev-launch-${patient}`)
        })
    }
}
