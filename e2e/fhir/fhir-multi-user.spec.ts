import { expect, Page, test } from '@playwright/test'

import { expectPatient } from '../actions/user-form-verification'
import { userInteractionsGroup } from '../utils/actions'
import { fillPeriodeRelative, nextStep, submitSykmelding } from '../actions/user-actions'
import { verifySummaryPage } from '../actions/user-verifications'

import { startNewSykmelding } from './actions/fhir-user-actions'
import { launchWithMock } from './actions/fhir-actions'

const Kari = { name: 'Kari Normann', fnr: '45847100951' }
const Espen = { name: 'Espen Eksempel', fnr: '21037712323' }

test('launching twice independently in same browser, but different tabs, should work', async ({ browser }) => {
    const baseContext = await browser.newContext()

    // Launch and verify Kari (tab 1)
    const firstTab = await baseContext.newPage()
    await launchWithMock('empty', { patient: 'Kari Normann' })(firstTab)
    await expectPatient(Kari)(firstTab.getByRole('region', { name: /Oversikt over (.*) sitt sykefravær/ }))

    // Launch and verify Espen (tab 2)
    const secondTab = await baseContext.newPage()
    await launchWithMock('one-current-to-tomorrow', { patient: 'Espen Eksempel' })(secondTab)
    await expectPatient(Espen)(secondTab.getByRole('region', { name: /Oversikt over (.*) sitt sykefravær/ }))

    // Reload tab 1 and verify Kari again
    await firstTab.reload()
    await expectPatient(Kari)(firstTab.getByRole('region', { name: /Oversikt over (.*) sitt sykefravær/ }))

    // Reload tab 2 and verify Espen again
    await secondTab.reload()
    await expectPatient(Espen)(secondTab.getByRole('region', { name: /Oversikt over (.*) sitt sykefravær/ }))

    // Fill tab 1 and ensure submit doesn't hit multi user error
    await fillAndSubmitMinimalSykmelding(Kari)(firstTab)

    // Fill tab 2 and ensure submit doesn't hit multi user error
    await fillAndSubmitMinimalSykmelding(Espen)(secondTab)
})

test('launching and opening a link in a new tab, should persist context and work with future launches', async ({
    browser,
}) => {
    const baseContext = await browser.newContext()

    const firstTab = await baseContext.newPage()
    await launchWithMock('empty', { patient: 'Kari Normann' })(firstTab)

    const pasientInfoRegion = firstTab.getByRole('region', { name: /Oversikt over (.*) sitt sykefravær/ })
    await expectPatient(Kari)(pasientInfoRegion)
    const [newTab] = await Promise.all([
        firstTab.context().waitForEvent('page'),
        pasientInfoRegion.getByRole('button', { name: 'Opprett sykmelding' }).click({ modifiers: ['ControlOrMeta'] }),
    ])

    await newTab.getByRole('button', { name: 'Avbryt og forkast' }).click()
    await expectPatient(Kari)(newTab.getByRole('region', { name: /Oversikt over (.*) sitt sykefravær/ }))

    const secondTab = await baseContext.newPage()
    await launchWithMock('one-current-to-tomorrow', { patient: 'Espen Eksempel' })(secondTab)
    await expectPatient(Espen)(secondTab.getByRole('region', { name: /Oversikt over (.*) sitt sykefravær/ }))

    await Promise.all([firstTab.reload(), newTab.reload(), secondTab.reload()])

    await expectPatient(Kari)(firstTab.getByRole('region', { name: /Oversikt over (.*) sitt sykefravær/ }))
    await expectPatient(Kari)(newTab.getByRole('region', { name: /Oversikt over (.*) sitt sykefravær/ }))
    await expectPatient(Espen)(secondTab.getByRole('region', { name: /Oversikt over (.*) sitt sykefravær/ }))

    // Complete all forms to make sure no multi-user errors occur
    await fillAndSubmitMinimalSykmelding(Kari)(firstTab)
    await fillAndSubmitMinimalSykmelding(Kari)(newTab)
    await fillAndSubmitMinimalSykmelding(Espen)(secondTab)
})

test.fail(
    'edge case: launching a second sessiond, returning to first one and opening a link in a new tab fails',
    async ({ browser }) => {
        const baseContext = await browser.newContext()

        // Launch and verify Kari (tab 1)
        const firstTab = await baseContext.newPage()
        await launchWithMock('empty', { patient: 'Kari Normann' })(firstTab)
        await expectPatient(Kari)(firstTab.getByRole('region', { name: /Oversikt over (.*) sitt sykefravær/ }))

        // Launch and verify Espen (tab 2)
        const secondTab = await baseContext.newPage()
        await launchWithMock('one-current-to-tomorrow', { patient: 'Espen Eksempel' })(secondTab)
        await expectPatient(Espen)(secondTab.getByRole('region', { name: /Oversikt over (.*) sitt sykefravær/ }))

        // Back to first tab and open a new tab from there
        const [thirdTab] = await Promise.all([
            firstTab.context().waitForEvent('page'),
            firstTab
                .getByRole('region', { name: /Oversikt over (.*) sitt sykefravær/ })
                .getByRole('button', { name: 'Opprett sykmelding' })
                .click({ modifiers: ['ControlOrMeta'] }),
        ])
        await thirdTab.getByRole('button', { name: 'Avbryt og forkast' }).click()
        // This fails, because Espen's tab was the last to launch, so the server will default to that session
        await expectPatient(Kari)(thirdTab.getByRole('region', { name: /Oversikt over (.*) sitt sykefravær/ }))

        await Promise.all([firstTab.reload(), thirdTab.reload(), secondTab.reload()])

        // This should be work:
        await expectPatient(Kari)(firstTab.getByRole('region', { name: /Oversikt over (.*) sitt sykefravær/ }))
        await expectPatient(Kari)(thirdTab.getByRole('region', { name: /Oversikt over (.*) sitt sykefravær/ }))
        await expectPatient(Espen)(secondTab.getByRole('region', { name: /Oversikt over (.*) sitt sykefravær/ }))

        // Complete all forms to make sure no multi-user errors occur
        await fillAndSubmitMinimalSykmelding(Kari)(firstTab)
        await fillAndSubmitMinimalSykmelding(Kari)(thirdTab)
        await fillAndSubmitMinimalSykmelding(Espen)(secondTab)
    },
)

const fillAndSubmitMinimalSykmelding =
    (whomst: typeof Kari) =>
    (page: Page): Promise<void> =>
        userInteractionsGroup(
            startNewSykmelding(whomst),
            fillPeriodeRelative({ type: { grad: 79 }, fromRelative: 0, days: 7 }),
            nextStep(),
            verifySummaryPage([
                {
                    name: 'Sykmeldingen gjelder',
                    values: [whomst.name, whomst.fnr],
                },
            ]),
            submitSykmelding(),
            (page) => expect(page.getByRole('heading', { name: 'Kvittering på innsendt sykmelding' })).toBeVisible(),
        )(page)
