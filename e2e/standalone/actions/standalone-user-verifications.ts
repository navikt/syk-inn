import { Page, test, expect } from '@playwright/test'

export function verifySignerendeBehandler(hpr: string) {
    return async (page: Page) => {
        await test.step('Verify signerende behandler', async () => {
            await expect(page.getByText(new RegExp(`HPR(.*)${hpr}`)), 'Correct HPR').toBeVisible()
        })
    }
}
