import { expect, Page, test } from '@playwright/test'

import { launchMode, Modes, modes, onMode } from './modes'

modes.forEach(({ mode }) => {
    test(`${mode}: when bruksvilkår toggle is on, user should be automatically redirected to bruksvilkår page`, async ({
        page,
    }) => {
        await launchMode(mode, 'noop', 'normal', {
            SYK_INN_REQUIRE_BRUKSVILKAR: true,
        })(page)

        const bruksvilkår = page.getByRole('region', { name: /Bruksvilkår for applikasjonen/ })
        await expect(bruksvilkår.getByRole('heading', { name: 'Bruksvilkår', exact: true })).toBeVisible()

        await expectBehandler(mode)(page)
    })

    test(`${mode}: accepting the bruksvilkår should allow you to return to the patient`, async ({ page }) => {
        await launchMode(mode, 'noop', 'normal', {
            SYK_INN_REQUIRE_BRUKSVILKAR: true,
        })(page)

        const accept = await expectBehandler(mode)(page)

        await accept
            .getByRole('checkbox', {
                name: 'Jeg bekrefter at jeg godtar disse bruksvilkårene, og ønsker å være en pilotbruker.',
            })
            .check()

        await accept.getByRole('button', { name: 'Send inn' }).click()
        await accept.getByRole('button', { name: 'Gå videre til sykemeldingsløsningen' }).click()

        await onMode(mode, {
            fhir: async (page) => {
                // Verify we're on the dashboard
                await expect(
                    page.getByRole('region', { name: /Oversikt over Espen Eksempel sitt sykefravær/ }),
                ).toBeVisible()
                // Reload the page
                await page.reload()
                // Verify we're not back to the bruksvilkår page
                await expect(
                    page.getByRole('region', { name: /Oversikt over Espen Eksempel sitt sykefravær/ }),
                ).toBeVisible()
            },
            standalone: async (page) => {
                // Verify we're on the dashboard
                await expect(page.getByRole('heading', { name: 'Velg pasient' })).toBeVisible()
                // Reload the page
                await page.reload()
                // Verify we're not back to the bruksvilkår page
                await expect(page.getByRole('heading', { name: 'Velg pasient' })).toBeVisible()
            },
        })(page)
    })
})

function expectBehandler(mode: Modes) {
    return async (page: Page) => {
        const accept = page.getByRole('region', { name: 'Godta bruksvilkår' })

        await onMode(mode, {
            fhir: async () => {
                await expect(accept.getByText('Du er Magnar Koman med HPR-nummer 9144889')).toBeVisible()
            },
            standalone: async () => {
                await expect(accept.getByText('Du er Johan Johansson med HPR-nummer 123456')).toBeVisible()
            },
        })(page)

        return accept
    }
}
