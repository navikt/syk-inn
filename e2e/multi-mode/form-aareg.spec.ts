import { test, expect } from '@playwright/test'
import { OpprettSykmeldingDocument } from '@queries'

import {
    fillPeriodeRelative,
    submitSykmelding,
    nextStep,
    previousStep,
    saveDraft,
    pickHoveddiagnose,
} from '../actions/user-actions'
import { anything, expectGraphQLRequest } from '../utils/assertions'
import { verifySummaryPage } from '../actions/user-verifications'
import { userInteractionsGroup } from '../utils/actions'
import * as standaloneActions from '../standalone/actions/standalone-user-actions'

import { modes, onMode } from './modes'
import { launchAndStart } from './actions/mode-user-actions'
import { expectedSykmeldingMeta, verifySignerendeBehandlerFillIfNeeded } from './actions/mode-user-verifications'

modes.forEach(({ mode }) => {
    test(`${mode}: aareg @feature-toggle - should be able to fill arbeidsforhold with AAREG data`, async ({ page }) => {
        await launchAndStart(mode, 'multiple-arbeidsforhold', {
            SYK_INN_AAREG: true,
        })(page)

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
            pickHoveddiagnose({ search: 'Angst', select: /Angstlidelse/ }),
            nextStep(),
            verifySignerendeBehandlerFillIfNeeded(mode),
            verifySummaryPage([
                {
                    name: 'Hvilke arbeidsforhold skal pasienten sykmeldes fra?',
                    values: ['Eksempel 2 AS'],
                },
            ]),
        )(page)

        const { request, draftId } = await submitSykmelding()(page)
        await expectGraphQLRequest(request).toBe(OpprettSykmeldingDocument, {
            draftId: draftId,
            meta: expectedSykmeldingMeta(mode),
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
                utdypendeSporsmal: {
                    utfordringerMedArbeid: null,
                    medisinskOppsummering: null,
                    hensynPaArbeidsplassen: null,
                },
            },
        })
    })

    test(`${mode}: aareg @feature-toggle - going to summary and returning should keep arbeidsgiver in Select`, async ({
        page,
    }) => {
        await launchAndStart(mode, 'multiple-arbeidsforhold', {
            SYK_INN_AAREG: true,
        })(page)

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
            pickHoveddiagnose({ search: 'Angst', select: /Angstlidelse/ }),
            nextStep(),
            verifySignerendeBehandlerFillIfNeeded(mode),
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

    test(`${mode}: aareg @feature-toggle - saving a draft and returning should keep arbeidsgiver in Select`, async ({
        page,
    }) => {
        await launchAndStart(mode, 'multiple-arbeidsforhold', {
            SYK_INN_AAREG: true,
        })(page)

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

        await onMode(mode, {
            fhir: async (page) => {
                await expect(page.getByRole('region', { name: 'Pågående sykmeldinger og utkast' })).toBeVisible()
            },
            standalone: async (page) => {
                await expect(page.getByRole('searchbox', { name: 'Finn pasient' })).toBeVisible()
            },
        })(page)

        // Make sure the cache/store is clean
        await page.reload()

        await onMode(mode, {
            fhir: async (page) => {
                await page
                    .getByRole('region', { name: 'Pågående sykmeldinger og utkast' })
                    .getByRole('button', { name: 'Åpne utkast' })
                    .first()
                    .click()
            },
            standalone: async (page) => {
                await standaloneActions.searchPerson('21037712323')(page)
                await standaloneActions.continueDraft('21037712323')(page)
            },
        })(page)

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
})
