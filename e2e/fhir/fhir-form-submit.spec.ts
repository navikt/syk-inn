import { test, expect } from '@playwright/test'
import { OpprettSykmeldingDocument } from '@queries'
import { inDays, inputDate, today } from '@lib/test/date-utils'

import {
    fillPeriodeRelative,
    submitSykmelding,
    nextStep,
    addBidiagnose,
    deleteBidiagnose,
} from '../actions/user-actions'
import { anything, expectGraphQLRequest } from '../utils/assertions'
import { expectBidagnoses, expectPeriode } from '../actions/user-form-verification'
import { wait } from '../utils/actions'
import {
    defaultAktivitetGradert,
    defaultAktivitetIkkeMulig,
    defaultOpprettSykmeldingValues,
    diagnoseSelection,
} from '../utils/submit-utils'

import { launchWithMock } from './actions/fhir-actions'
import { startNewSykmelding } from './actions/fhir-user-actions'
import { verifyIsOnKvitteringPage, verifySignerendeBehandler } from './actions/fhir-user-verifications'

test('submit with only default values and prefilled FHIR values', async ({ page }) => {
    await launchWithMock('empty')(page)
    await startNewSykmelding({ name: 'Espen Eksempel', fnr: '21037712323' })(page)

    await test.step('fill only values that are not prefilled (tom, grad)', async () => {
        // Tom is not prefilled
        await page.getByRole('textbox', { name: 'Til og med' }).fill(inputDate(inDays(3)))

        // Grad is not prefilled
        await page.getByRole('textbox', { name: 'Sykmeldingsgrad (%)' }).fill(`60`)
    })

    await nextStep()(page)
    await verifySignerendeBehandler()(page)

    const { request, draftId } = await submitSykmelding()(page)
    await expectGraphQLRequest(request).toBe(OpprettSykmeldingDocument, {
        draftId: draftId,
        meta: { orgnummer: null, legekontorTlf: null },
        force: false,
        values: {
            ...defaultOpprettSykmeldingValues,
            hoveddiagnose: diagnoseSelection.any.verify,
            aktivitet: [
                defaultAktivitetGradert({
                    fom: today(),
                    tom: inDays(3),
                    grad: 60,
                }),
            ],
        },
    })

    await verifyIsOnKvitteringPage()(page)
})

test('should be able to submit purely with shortcuts', async ({ page }) => {
    await launchWithMock('empty')(page)

    // Wait for dashboard to load completely
    await expect(page.getByRole('region', { name: 'Oversikt over Espen Eksempel sitt sykefravær' })).toBeVisible()

    // Start new sykmelding with shortcut Alt+N
    await page.keyboard.press('Alt+KeyN')

    await test.step('fill only values that are not prefilled (tom, grad)', async () => {
        await page.getByRole('textbox', { name: 'Til og med' }).fill(inputDate(inDays(3)))
        await page.getByRole('textbox', { name: 'Sykmeldingsgrad (%)' }).fill(`60`)
    })

    // Go to summary with shortcut Alt+N
    await page.keyboard.press('Alt+KeyN')
    await verifySignerendeBehandler()(page)

    // Should be able to return with shortcut Alt+LeftArrow
    await page.keyboard.press('Alt+ArrowLeft')
    await expectPeriode({ type: { grad: 60 }, days: 3, fromRelative: 0 })(page)

    // Go to summary with shortcut Alt+N again
    await page.keyboard.press('Alt+KeyN')
    await verifySignerendeBehandler()(page)

    // Animations AAAAAAAAAAAAaaaaaaaaaaaa
    await wait(500, 0)

    // Submit sykmelding
    await page.keyboard.press('Alt+KeyN')

    await verifyIsOnKvitteringPage()(page)
})

test('should pre-fill bidiagnoser from FHIR @feature-toggle', async ({ page }) => {
    await launchWithMock('empty', {
        SYK_INN_AUTO_BIDIAGNOSER: true,
    })(page)
    await startNewSykmelding({ name: 'Espen Eksempel', fnr: '21037712323' })(page)

    await fillPeriodeRelative({
        type: '100%',
        days: 3,
    })(page)

    await nextStep()(page)
    await verifySignerendeBehandler()(page)

    const { request, draftId } = await submitSykmelding()(page)
    await expectGraphQLRequest(request).toBe(OpprettSykmeldingDocument, {
        draftId: draftId,
        meta: { orgnummer: null, legekontorTlf: null },
        force: false,
        values: {
            ...defaultOpprettSykmeldingValues,
            // Pre filled from FHIR
            hoveddiagnose: { code: 'L73', system: 'ICPC2' },
            // Pre filled from FHIR
            bidiagnoser: [
                { system: 'ICPC2', code: 'P74' },
                { system: 'ICD10', code: 'A051' },
            ],
            aktivitet: [
                defaultAktivitetIkkeMulig({
                    fom: today(),
                    tom: inDays(3),
                }),
            ],
        },
    })

    await verifyIsOnKvitteringPage()(page)
})

test.describe('Resetting diagnoser when prefilled from FHIR @feature-toggle', () => {
    test('adding extra diagnose and resetting them should remove them', async ({ page }) => {
        await launchWithMock('empty', {
            // Kari only has one diagnose in FHIR
            patient: 'Kari Normann',
            SYK_INN_AUTO_BIDIAGNOSER: true,
        })(page)
        await startNewSykmelding()(page)
        await fillPeriodeRelative({ type: '100%', days: 3 })(page)
        await addBidiagnose({ search: 'A03', select: /Feber/ })(page)

        await test.step('Reset diagnoser', async () => {
            await expectBidagnoses(['Feber'])(page)
            await page.getByRole('button', { name: 'Bruk diagnoser fra EPJ' }).click()
            await expectBidagnoses([])(page)
        })

        await nextStep()(page)
        await verifySignerendeBehandler()(page)

        const { request, draftId } = await submitSykmelding()(page)
        await expectGraphQLRequest(request).toBe(OpprettSykmeldingDocument, {
            draftId: draftId,
            force: false,
            meta: anything(),
            values: {
                ...defaultOpprettSykmeldingValues,
                aktivitet: anything(),
            },
        })

        await verifyIsOnKvitteringPage()(page)
    })

    test('removing diagonses from FHIR prefill and reseetting them should add them back', async ({ page }) => {
        await launchWithMock('empty', {
            // Espen has 3 diagnoser in FHIR
            patient: 'Espen Eksempel',
            SYK_INN_AUTO_BIDIAGNOSER: true,
        })(page)
        await startNewSykmelding()(page)
        await fillPeriodeRelative({ type: '100%', days: 3 })(page)
        await expectBidagnoses(['Angstlidelse', 'Botulisme'])(page)
        await deleteBidiagnose(2)(page)
        await deleteBidiagnose(1)(page)
        await expectBidagnoses([])(page)

        await test.step('Reset diagnoser', async () => {
            await page.getByRole('button', { name: 'Bruk diagnoser fra EPJ' }).click()
            await expectBidagnoses(['Angstlidelse', 'Botulisme'])(page)
        })

        await nextStep()(page)
        await verifySignerendeBehandler()(page)

        const { request, draftId } = await submitSykmelding()(page)
        await expectGraphQLRequest(request).toBe(OpprettSykmeldingDocument, {
            draftId: draftId,
            force: false,
            meta: anything(),
            values: {
                ...defaultOpprettSykmeldingValues,
                // Pre filled from FHIR
                hoveddiagnose: { code: 'L73', system: 'ICPC2' },
                // Pre filled from FHIR
                bidiagnoser: [
                    { system: 'ICPC2', code: 'P74' },
                    { system: 'ICD10', code: 'A051' },
                ],
                aktivitet: anything(),
            },
        })

        await verifyIsOnKvitteringPage()(page)
    })
})
