import { expect, Locator, test } from '@playwright/test'

import { fillPeriodeRelative, nextStep, pickHoveddiagnose } from '../actions/user-actions'
import { verifyIsOnKvitteringPage } from '../fhir/actions/fhir-user-verifications'
import { wait } from '../utils/actions'

import { verifySignerendeBehandlerFillIfNeeded } from './actions/mode-user-verifications'
import { launchAndStart } from './actions/mode-user-actions'
import { modes } from './modes'

modes.forEach(({ mode }) => {
    test.fail(`${mode}: spamming 'Send'-button repeatedly should only submit 1 sykmelding`, async ({ page }) => {
        await launchAndStart(mode, 'empty')(page)

        await fillPeriodeRelative({
            type: '100%',
            days: 3,
        })(page)

        await pickHoveddiagnose({ search: 'Angst', select: /Angstlidelse/ })(page)

        await nextStep()(page)
        await verifySignerendeBehandlerFillIfNeeded(mode)(page)

        const sendButton = page.getByRole('button', { name: 'Send inn' })
        await attemptButtonSpam(sendButton)

        await verifyIsOnKvitteringPage()(page)
        await page.getByRole('button', { name: 'Tilbake til pasientoversikt' }).click()

        const currentRegion = page.getByRole('region', { name: 'Pågående sykmeldinger og utkast' })
        const rows = currentRegion.getByRole('row')

        await expect(rows).toHaveCount(2) // Header row + 1 sykmelding
    })
})

/**
 * Attemps to inhumanly spam the button multiple times. Does not fail if the button disappears
 */
async function attemptButtonSpam(button: Locator, count = 10): Promise<[ok: number, failed: number]> {
    return test.step(`Spam the button ${count} times inhumanly fast`, async () => {
        let successfulClicks = 0
        let failedClicks = 0

        const clickPromises = []
        for (let i = 0; i < 10; i++) {
            clickPromises.push(
                button
                    .click({ timeout: 1000 })
                    .then(() => successfulClicks++)
                    .catch(() => failedClicks++),
            )
            await wait(32, 0)
        }

        await Promise.all(clickPromises)

        return [successfulClicks, failedClicks] as const
    })
}
