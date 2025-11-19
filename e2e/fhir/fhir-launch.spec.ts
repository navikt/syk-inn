import test, { expect } from '@playwright/test'

import { launchPath } from './actions/fhir-actions'

test('launching with an unknown issuer should not work', async ({ page }) => {
    await page.goto(
        `${launchPath}?iss=https://syk-inn.ekstern.dev.nav.no/samarbeidspartner/sykmelding/api/mocks/fhir&launch=demo-param`,
    )

    await expect(page.getByRole('heading', { name: 'Ugyldig utsteder' })).toBeVisible()
})
