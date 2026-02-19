import { expect, test } from '@playwright/test'

import { launchWithMock } from './actions/fhir-actions'

test('when bruksvilkår toggle is on, user should be automatically redirected to bruksvilkår page', async ({ page }) => {
    await launchWithMock('normal', {
        SYK_INN_REQUIRE_BRUKSVILKAR: true,
    })(page)

    const bruksvilkår = page.getByRole('region', { name: /Bruksvilkår for applikasjonen/ })
    await expect(bruksvilkår.getByRole('heading', { name: 'Bruksvilkår', exact: true })).toBeVisible()

    const accept = page.getByRole('region', { name: 'Godta bruksvilkår' })
    await expect(accept.getByText('Du er Magnar Koman med HPR-nummer 9144889')).toBeVisible()
})

test('accepting the bruksvilkår should allow you to return to the patient', async ({ page }) => {
    await launchWithMock('normal', {
        SYK_INN_REQUIRE_BRUKSVILKAR: true,
    })(page)

    const accept = page.getByRole('region', { name: 'Godta bruksvilkår' })
    await expect(accept.getByText('Du er Magnar Koman med HPR-nummer 9144889')).toBeVisible()

    await accept
        .getByRole('checkbox', {
            name: 'Jeg bekrefter at jeg godtar disse bruksvilkårene, og ønsker å være en pilotbruker.',
        })
        .check()

    await accept.getByRole('button', { name: 'Send inn' }).click()
    await accept.getByRole('link', { name: 'Gå tilbake til pasienten' }).click()

    // Verify we're on the dashboard
    await expect(page.getByRole('region', { name: /Oversikt over Espen Eksempel sitt sykefravær/ })).toBeVisible()

    // Reload the page
    await page.reload()

    // Verify we're not back to the bruksvilkår page
    await expect(page.getByRole('region', { name: /Oversikt over Espen Eksempel sitt sykefravær/ })).toBeVisible()
})
