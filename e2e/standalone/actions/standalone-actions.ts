import { Page, test } from '@playwright/test'
import { ExpectedToggles } from '@core/toggles/toggles'
import { Scenarios } from '@dev/mock-engine/scenarios/scenarios'
import { MockBehandlere } from '@navikt/helseid-mock-server'

import { applyToggleOverrides } from '../../actions/toggle-overrides'

const startPath = '/api/mocks/helseid/dev/start-user'

type ToggleOverrides = Partial<Record<ExpectedToggles, boolean>>

type AdditionalOptions = {
    behandler?: MockBehandlere
}

export function launchWithMock(
    scenario: Scenarios = 'empty',
    { behandler = 'Johan Johansson', ...toggleOverrides }: ToggleOverrides & AdditionalOptions,
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

        const startUrlWithBehandler = `${startPath}?user=${encodeURIComponent(behandler)}&returnTo=/`

        if (scenario != 'normal') {
            return test.step(`Launch scenario ${scenario} (${behandler})`, async () => {
                await page.goto(
                    `/dev/set-scenario/${scenario}?returnTo=${encodeURIComponent(`${startUrlWithBehandler}`)}`,
                )
            })
        }

        return test.step(`Launch Standalone mock with default scenario (normal, ${behandler})`, async () => {
            await page.goto(startUrlWithBehandler)
        })
    }
}
