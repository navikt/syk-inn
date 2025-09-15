import { test } from '@playwright/test'

import { launchWithMock } from './actions/fhir-actions'
import { expectPatient } from './actions/user-form-verification'

const Kari = { name: 'Kari Normann', fnr: '45847100951' }
const Espen = { name: 'Espen Eksempel', fnr: '21037712323' }

test('launching twice independently in same browser, but different tabs, should work', async ({ browser }) => {
    const baseContext = await browser.newContext()

    // Launch and verify Kari (tab 1)
    const firstTab = await baseContext.newPage()
    await launchWithMock('empty', { patient: 'kari' })(firstTab)
    await expectPatient(Kari)(firstTab.getByRole('region', { name: 'Opprett ny sykmelding' }))

    // Launch and verify Espen (tab 2)
    const secondTab = await baseContext.newPage()
    await launchWithMock('one-current-to-tomorrow', { patient: 'espen' })(secondTab)
    await expectPatient(Espen)(secondTab.getByRole('region', { name: 'Opprett ny sykmelding' }))

    // Reload tab 1 and verify Kari again
    await firstTab.reload()
    await expectPatient(Kari)(firstTab.getByRole('region', { name: 'Opprett ny sykmelding' }))

    // Reload tab 2 and verify Espen again
    await secondTab.reload()
    await expectPatient(Espen)(secondTab.getByRole('region', { name: 'Opprett ny sykmelding' }))
})
