import { expect, test } from '@playwright/test'

import { launchWithMock } from '../actions/fhir-actions'
import { startNewSykmelding } from '../actions/fhir-user-actions'
import { fillPeriodeRelative, nextStep, saveDraft, submitSykmelding } from '../../actions/user-actions'
import { expectPeriode } from '../../actions/user-form-verification'
import { verifyIsOnKvitteringPage, verifySignerendeBehandler } from '../actions/fhir-user-verifications'
import { userInteractionsGroup } from '../../utils/actions'

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

test('should be able to open and edit a draft from the dashboard', async ({ page }) => {
    await launchWithMock('empty')(page)
    await startNewSykmelding()(page)
    await fillPeriodeRelative({
        type: '100%',
        days: 3,
    })(page)
    await saveDraft()(page)

    await test.step('Open the draft', async () => {
        const region = page.getByRole('region', { name: 'Pågående sykmeldinger og utkast' })
        const rows = region.getByRole('row')
        await rows.nth(1).getByRole('link').click()
    })

    await userInteractionsGroup(
        expectPeriode({ type: '100%', days: 3, fromRelative: 0 }),
        nextStep(),
        verifySignerendeBehandler(),
        submitSykmelding(),
        verifyIsOnKvitteringPage(),
    )(page)
})
