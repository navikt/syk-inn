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

test('launching and opening a link in a new tab, should persist context and work with future launches', async ({
    browser,
}) => {
    const baseContext = await browser.newContext()

    const firstTab = await baseContext.newPage()
    await launchWithMock('empty', { patient: 'kari' })(firstTab)

    const pasientInfoRegion = firstTab.getByRole('region', { name: 'Opprett ny sykmelding' })
    await expectPatient(Kari)(pasientInfoRegion)
    const [newTab] = await Promise.all([
        firstTab.context().waitForEvent('page'),
        pasientInfoRegion.getByRole('button', { name: 'Opprett sykmelding' }).click({ modifiers: ['ControlOrMeta'] }),
    ])

    await newTab.getByRole('button', { name: 'Avbryt og forkast' }).click()
    await expectPatient(Kari)(newTab.getByRole('region', { name: 'Opprett ny sykmelding' }))

    const secondTab = await baseContext.newPage()
    await launchWithMock('one-current-to-tomorrow', { patient: 'espen' })(secondTab)
    await expectPatient(Espen)(secondTab.getByRole('region', { name: 'Opprett ny sykmelding' }))

    await Promise.all([firstTab.reload(), newTab.reload(), secondTab.reload()])

    await expectPatient(Kari)(firstTab.getByRole('region', { name: 'Opprett ny sykmelding' }))
    await expectPatient(Kari)(newTab.getByRole('region', { name: 'Opprett ny sykmelding' }))
    await expectPatient(Espen)(secondTab.getByRole('region', { name: 'Opprett ny sykmelding' }))
})

test.fail(
    'edge case: launching a second sessiond, returning to first one and opening a link in a new tab fails',
    async ({ browser }) => {
        const baseContext = await browser.newContext()

        // Launch and verify Kari (tab 1)
        const firstTab = await baseContext.newPage()
        await launchWithMock('empty', { patient: 'kari' })(firstTab)
        await expectPatient(Kari)(firstTab.getByRole('region', { name: 'Opprett ny sykmelding' }))

        // Launch and verify Espen (tab 2)
        const secondTab = await baseContext.newPage()
        await launchWithMock('one-current-to-tomorrow', { patient: 'espen' })(secondTab)
        await expectPatient(Espen)(secondTab.getByRole('region', { name: 'Opprett ny sykmelding' }))

        // Back to first tab and open a new tab from there
        const [thirdTab] = await Promise.all([
            firstTab.context().waitForEvent('page'),
            firstTab
                .getByRole('region', { name: 'Opprett ny sykmelding' })
                .getByRole('button', { name: 'Opprett sykmelding' })
                .click({ modifiers: ['ControlOrMeta'] }),
        ])
        await thirdTab.getByRole('button', { name: 'Avbryt og forkast' }).click()
        // This fails, because Espen's tab was the last to launch, so the server will default to that session
        await expectPatient(Kari)(thirdTab.getByRole('region', { name: 'Opprett ny sykmelding' }))

        await Promise.all([firstTab.reload(), thirdTab.reload(), secondTab.reload()])

        // This should be work:
        await expectPatient(Kari)(firstTab.getByRole('region', { name: 'Opprett ny sykmelding' }))
        await expectPatient(Kari)(thirdTab.getByRole('region', { name: 'Opprett ny sykmelding' }))
        await expectPatient(Espen)(secondTab.getByRole('region', { name: 'Opprett ny sykmelding' }))
    },
)
