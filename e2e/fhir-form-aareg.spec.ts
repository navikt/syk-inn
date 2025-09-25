import { test, expect } from '@playwright/test'

import { OpprettSykmeldingDocument } from '@queries'

import { launchWithMock } from './actions/fhir-actions'
import {
    startNewSykmelding,
    fillPeriodeRelative,
    submitSykmelding,
    nextStep,
    previousStep,
    saveDraft,
} from './actions/user-actions'
import { anything, expectGraphQLRequest } from './utils/assertions'
import { getDraftId } from './utils/request-utils'
import { verifySignerendeBehandler, verifySummaryPage } from './actions/user-verifications'
import { userInteractionsGroup } from './utils/actions'

test('aareg @feature-toggle - should be able to fill arbeidsforhold with AAREG data', async ({ page }) => {
    await userInteractionsGroup(
        launchWithMock('multiple-arbeidsforhold', {
            SYK_INN_AAREG: true,
        }),
        startNewSykmelding({ name: 'Espen Eksempel', fnr: '21037712323' }),
    )(page)

    await test.step('Fill out the new AAREG-backed arbeidsforhold-picker', async () => {
        const arbeidsforholdSection = page.getByRole('region', { name: 'Arbeidsgiver' })
        await arbeidsforholdSection
            .getByRole('group', { name: 'Har pasienten flere arbeidsforhold?' })
            .getByText('Ja')
            .click()
        await arbeidsforholdSection
            .getByRole('combobox', { name: 'Hvilke arbeidsforhold skal pasienten sykmeldes fra?' })
            .selectOption('Eksempel 2 AS (987654321)')
    })

    await userInteractionsGroup(
        fillPeriodeRelative({ type: '100%', days: 3 }),
        nextStep(),
        verifySignerendeBehandler(),
        verifySummaryPage([
            {
                name: 'Hvilke arbeidsforhold skal pasienten sykmeldes fra?',
                values: ['Eksempel 2 AS'],
            },
        ]),
    )(page)

    const request = await submitSykmelding()(page)
    await expectGraphQLRequest(request).toBe(OpprettSykmeldingDocument, {
        draftId: getDraftId(page) ?? 'missing',
        force: false,
        values: {
            arbeidsforhold: {
                arbeidsgivernavn: 'Eksempel 2 AS',
            },
            hoveddiagnose: anything(),
            bidiagnoser: anything(),
            aktivitet: anything(),
            meldinger: anything(),
            svangerskapsrelatert: anything(),
            yrkesskade: anything(),
            pasientenSkalSkjermes: false,
            tilbakedatering: null,
        },
    })
})

test('aareg @feature-toggle - going to summary and returning should keep arbeidsgiver in Select', async ({ page }) => {
    await userInteractionsGroup(
        launchWithMock('multiple-arbeidsforhold', {
            SYK_INN_AAREG: true,
        }),
        startNewSykmelding({ name: 'Espen Eksempel', fnr: '21037712323' }),
    )(page)

    await test.step('Fill out the new AAREG-backed arbeidsforhold-picker', async () => {
        const arbeidsforholdSection = page.getByRole('region', { name: 'Arbeidsgiver' })
        await arbeidsforholdSection
            .getByRole('group', { name: 'Har pasienten flere arbeidsforhold?' })
            .getByText('Ja')
            .click()
        await arbeidsforholdSection
            .getByRole('combobox', { name: 'Hvilke arbeidsforhold skal pasienten sykmeldes fra?' })
            .selectOption('Eksempel 2 AS (987654321)')
    })

    await userInteractionsGroup(
        fillPeriodeRelative({ type: '100%', days: 3 }),
        nextStep(),
        verifySignerendeBehandler(),
        previousStep(),
    )(page)

    await test.step('verify that the arbeidsforhold is still selected', async () => {
        const arbeidsforholdSection = page.getByRole('region', { name: 'Arbeidsgiver' })
        await expect(
            arbeidsforholdSection
                .getByRole('group', { name: 'Har pasienten flere arbeidsforhold?' })
                .getByRole('radio', { name: 'Ja' }),
        ).toBeChecked()
        await expect(
            arbeidsforholdSection.getByRole('combobox', {
                name: 'Hvilke arbeidsforhold skal pasienten sykmeldes fra?',
            }),
        ).toHaveValue('Eksempel 2 AS')
    })
})

test('aareg @feature-toggle - saving a draft and returning should keep arbeidsgiver in Select', async ({ page }) => {
    await userInteractionsGroup(
        launchWithMock('multiple-arbeidsforhold', {
            SYK_INN_AAREG: true,
        }),
        startNewSykmelding({ name: 'Espen Eksempel', fnr: '21037712323' }),
    )(page)

    await test.step('Fill out the new AAREG-backed arbeidsforhold-picker', async () => {
        const arbeidsforholdSection = page.getByRole('region', { name: 'Arbeidsgiver' })
        await arbeidsforholdSection
            .getByRole('group', { name: 'Har pasienten flere arbeidsforhold?' })
            .getByText('Ja')
            .click()
        await arbeidsforholdSection
            .getByRole('combobox', { name: 'Hvilke arbeidsforhold skal pasienten sykmeldes fra?' })
            .selectOption('Eksempel 2 AS (987654321)')
    })

    await userInteractionsGroup(fillPeriodeRelative({ type: '100%', days: 3 }), saveDraft())(page)
    await expect(page.getByRole('region', { name: 'Tidligere sykmeldinger og utkast' })).toBeVisible()

    // Make sure the cache/store is clean
    await page.reload()

    await page
        .getByRole('region', { name: 'Tidligere sykmeldinger og utkast' })
        .getByRole('button', { name: 'Åpne utkast' })
        .first()
        .click()

    await test.step('verify that the arbeidsforhold is still selected', async () => {
        const arbeidsforholdSection = page.getByRole('region', { name: 'Arbeidsgiver' })
        await expect(
            arbeidsforholdSection
                .getByRole('group', { name: 'Har pasienten flere arbeidsforhold?' })
                .getByRole('radio', { name: 'Ja' }),
        ).toBeChecked()
        await expect(
            arbeidsforholdSection.getByRole('combobox', {
                name: 'Hvilke arbeidsforhold skal pasienten sykmeldes fra?',
            }),
        ).toHaveValue('Eksempel 2 AS')
    })
})
