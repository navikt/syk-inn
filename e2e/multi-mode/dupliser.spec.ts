import { expect, test } from '@playwright/test'

import {
    addBidiagnose,
    fillPeriodeRelative,
    nextStep,
    pickHoveddiagnose,
    submitSykmelding,
} from '../actions/user-actions'
import { verifySummaryPage } from '../actions/user-verifications'
import { expectBidagnoses, expectHoveddiagnose, expectPeriode } from '../actions/user-form-verification'

import { launchAndStart } from './mode-actions'
import { modes } from './modes'
import { verifySignerendeBehandlerFillIfNeeded } from './mode-verifications'

modes.forEach(({ mode }) => {
    test(`${mode}: should be able to duplicate from kvittering`, async ({ page }) => {
        await launchAndStart(mode)(page)

        await fillPeriodeRelative({
            type: '100%',
            days: 3,
        })(page)

        await pickHoveddiagnose({ search: 'Angst', select: /Angstlidelse/ })(page)
        await addBidiagnose({ search: 'P17', select: /Tobakkmisbruk/ })(page)

        await nextStep()(page)
        await verifySignerendeBehandlerFillIfNeeded(mode)(page)
        await verifySummaryPage([
            {
                name: 'Periode',
                values: [/100% sykmelding/],
            },
        ])(page)

        await submitSykmelding()(page)

        await expect(page.getByRole('heading', { name: 'Kvittering på innsendt sykmelding' })).toBeVisible()

        await page.getByRole('button', { name: 'Dupliser' }).click()

        await test.step('Verify form values', async () => {
            await expectPeriode({ type: '100%', days: 3, fromRelative: 0 })(page)
            await expectHoveddiagnose('P74 - Angstlidelse')(page)
            await expectBidagnoses(['P17 - Tobakkmisbruk'])(page)
        })
    })
})
