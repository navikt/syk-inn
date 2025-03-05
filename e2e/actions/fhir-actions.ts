import { Page } from '@playwright/test'

export async function launchWithMock(page: Page): Promise<void> {
    await page.goto(`/fhir/launch?iss=http://localhost:3000/api/mocks/fhir&launch=foo-bar-launch`)
}
