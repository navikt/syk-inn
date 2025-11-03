import { Page, test, expect } from '@playwright/test'

export function verifySignerendeBehandler(hpr: string) {
    return async (page: Page) => {
        await test.step('Verify signerende behandler', async () => {
            const region = page.getByRole('region', { name: 'Signerende behandler' })

            await expect(region.getByText(new RegExp(`HPR(.*)${hpr}`)), 'Correct HPR').toBeVisible()
        })
    }
}
