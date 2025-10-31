import { expect, Page, test } from '@playwright/test'

export function verifySignerendeBehandler() {
    return async (page: Page) => {
        await test.step('Verify signerende behandler', async () => {
            await expect(page.getByText(/HPR(.*)9144889/), 'Correct HPR').toBeVisible()
            await expect(page.getByText(/Organisasjonsnummer(.*)123456789/), 'Correct Org').toBeVisible()
        })
    }
}
