import { expect, Page, test } from '@playwright/test'

export function verifySignerendeBehandler() {
    return async (page: Page) => {
        await test.step('Verify signerende behandler', async () => {
            const region = page.getByRole('region', { name: 'Signerende behandler' })

            await expect(region.getByText(/HPR(.*)9144889/), 'Correct HPR').toBeVisible()
            await expect(region.getByText(/Organisasjonsnummer(.*)123456789/), 'Correct Org').toBeVisible()
        })
    }
}

export function verifyIsOnKvitteringPage() {
    return async (page: Page) => {
        await test.step('Verify is on kvittering page', async () => {
            await expect(page.getByRole('heading', { name: 'Kvittering på innsendt sykmelding' })).toBeVisible()
        })
    }
}
