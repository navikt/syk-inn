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

import { launchWithMock } from './actions/standalone-actions'
import { fillOrgnummer, fillTelefonnummer, searchPerson, startNewSykmelding } from './actions/standalone-user-actions'
import { verifySignerendeBehandler } from './actions/standalone-user-verifications'

test('should be able to duplicate from kvittering', async ({ page }) => {
    await launchWithMock('empty', {
        behandler: 'Johan Johansson',
    })(page)

    await searchPerson('21037712323')(page)
    await startNewSykmelding('21037712323')(page)

    await fillPeriodeRelative({
        type: '100%',
        days: 3,
    })(page)

    await pickHoveddiagnose({ search: 'Angst', select: /Angstlidelse/ })(page)
    await addBidiagnose({ search: 'P17', select: /Tobakkmisbruk/ })(page)

    await nextStep()(page)
    await verifySignerendeBehandler('123456')(page)
    await verifySummaryPage([
        {
            name: 'Periode',
            values: [/100% sykmelding/],
        },
    ])(page)

    await fillOrgnummer('112233445')(page)
    await fillTelefonnummer('+47 99887766')(page)
    await submitSykmelding()(page)

    await expect(page.getByRole('heading', { name: 'Kvittering på innsendt sykmelding' })).toBeVisible()

    await page.getByRole('button', { name: 'Dupliser' }).click()

    await test.step('Verify form values', async () => {
        await expectPeriode({ type: '100%', days: 3, fromRelative: 0 })(page)
        await expectHoveddiagnose('P74 - Angstlidelse')(page)
        await expectBidagnoses(['P17 - Tobakkmisbruk'])(page)
    })
})
