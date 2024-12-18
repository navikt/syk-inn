import { expect, Page } from '@playwright/test'

export async function launchWithMock(page: Page): Promise<void> {
    await page.goto(`/fhir/launch?iss=http://localhost:3000/api/mocks/fhir`)

    await expect(page.getByRole('heading', { name: 'Opprett ny sykmelding' })).toBeVisible()
}
