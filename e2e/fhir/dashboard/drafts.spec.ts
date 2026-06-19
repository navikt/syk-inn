import { expect, test } from '@playwright/test'

import {
    fillBehandlingsdagerExplanation,
    fillBehandlingsdagerPeriode,
    fillPeriodeRelative,
    nextStep,
    saveDraft,
    submitSykmelding,
} from '../../actions/user-actions'
import { expectBehandlingsdagerForklaring, expectPeriode } from '../../actions/user-form-verification'
import { userInteractionsGroup } from '../../utils/actions'
import { verifyNoHorizontalScroll } from '../../utils/assertions'
import { launchWithMock } from '../actions/fhir-actions'
import { startNewAlternateSykmelding, startNewSykmelding } from '../actions/fhir-user-actions'
import { verifyIsOnKvitteringPage, verifySignerendeBehandler } from '../actions/fhir-user-verifications'

test('quickly delete a lot of drafts', async ({ page }) => {
    await launchWithMock('plenty-of-drafts')(page)

    // Verify that we have a lot of drafts
    const drafts = page.getByRole('button', { name: 'Åpne utkast' })
    await expect(drafts).toHaveCount(15)

    await verifyNoHorizontalScroll()(page)

    await test.step('delete 15 drafts', async () => {
        for (let i = 0; i < 15; i++) {
            await page.getByRole('button', { name: 'Slett utkast' }).nth(0).click()
        }
    })

    await page.waitForLoadState('networkidle')

    await expect(page.getByText('Tilgang til sykmeldingshistorikk vil bli logget av Nav.')).toBeVisible()
})

test('open and edit a draft from the dashboard', async ({ page }) => {
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
        verifyNoHorizontalScroll(),
        nextStep(),
        verifySignerendeBehandler(),
        verifyNoHorizontalScroll(),
        submitSykmelding(),
        verifyIsOnKvitteringPage(),
    )(page)
})

test('save and continue editing a behandlingsdager draft', async ({ page }) => {
    await launchWithMock('empty', { SYK_INN_SYKMELDING_BEHANDLINGSDAGER: true })(page)
    await startNewAlternateSykmelding('BEHANDLINGSDAGER')(page)
    await fillBehandlingsdagerPeriode({ days: 6 })(page)
    await fillBehandlingsdagerExplanation('Foo bar baz')(page)
    await saveDraft()(page)

    // Lets reload so we make sure the draft we verify is not from the apollo cache
    await expect(page.getByRole('region', { name: 'Pågående sykmeldinger og utkast' })).toBeVisible()
    await page.reload()

    await test.step('Open the draft', async () => {
        const region = page.getByRole('region', { name: 'Pågående sykmeldinger og utkast' })
        const rows = region.getByRole('row')
        await rows.nth(1).getByRole('link').click()
    })

    await userInteractionsGroup(
        expectPeriode({ type: { behandlingsdager: 1 }, days: 6, fromRelative: 0 }),
        expectBehandlingsdagerForklaring('Foo bar baz'),
        verifyNoHorizontalScroll(),
        nextStep(),
        verifySignerendeBehandler(),
        verifyNoHorizontalScroll(),
        submitSykmelding(),
        verifyIsOnKvitteringPage(),
    )(page)
})
