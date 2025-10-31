import { Page, test } from '@playwright/test'

import { ExpectedToggles } from '@core/toggles/toggles'

export type ToggleOverrides = Partial<Record<ExpectedToggles, boolean>>

export async function applyToggleOverrides(page: Page, toggleOverrides: ToggleOverrides): Promise<void> {
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
