import { expect, Page } from '@playwright/test'

export async function launchStandalone(page: Page): Promise<void> {
    await page.goto(`/ny`)

    await expect(page.getByRole('heading', { name: 'Opprett ny sykmelding' })).toBeVisible()
}
