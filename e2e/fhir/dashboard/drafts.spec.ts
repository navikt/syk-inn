import { expect, test } from '@playwright/test'

import { launchWithMock } from '../actions/fhir-actions'

test('should be able to quickly delete a lot of drafts', async ({ page }) => {
    await launchWithMock('plenty-of-drafts')(page)

    // Verify that we have a lot of drafts
    const drafts = page.getByRole('button', { name: 'Åpne utkast' })
    await expect(drafts).toHaveCount(15)

    await test.step('delete 15 drafts', async () => {
        for (let i = 0; i < 15; i++) {
            await page.getByRole('button', { name: 'Slett utkast' }).nth(0).click()
        }
    })

    await page.waitForLoadState('networkidle')

    await expect(page.getByText('Tilgang til sykmeldingshistorikk vil bli logget av Nav.')).toBeVisible()
})
