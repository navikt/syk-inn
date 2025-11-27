import { test, expect, Page } from '@playwright/test'
import { toReadableDate, toReadableDatePeriod } from '@lib/date'
import { daysAgo } from '@lib/test/date-utils'

import {
    pickHoveddiagnose,
    fillPeriodeRelative,
    fillTilbakedatering,
    fillAndreSporsmal,
    fillMeldinger,
    nextStep,
    previousStep,
    saveDraft,
    fillArbeidsforhold,
    addBidiagnose,
} from '../actions/user-actions'
import { userInteractionsGroup } from '../utils/actions'
import {
    expectAndreSporsmal,
    expectBidagnoses,
    expectHoveddiagnose,
    expectMeldinger,
    expectPeriode,
    expectTilbakedatering,
} from '../actions/user-form-verification'
import { verifySummaryPage } from '../actions/user-verifications'
import * as standaloneActions from '../standalone/actions/standalone-user-actions'

import { modes, Modes, onMode } from './modes'
import { launchAndStart } from './actions/mode-user-actions'
import { verifySignerendeBehandlerFillIfNeeded } from './actions/mode-user-verifications'

const fillAllTheValues = (mode: Modes): ((page: Page) => Promise<void>) =>
    userInteractionsGroup(
        launchAndStart(mode),
        fillArbeidsforhold({
            harFlereArbeidsforhold: false,
        }),
        fillPeriodeRelative({
            type: { grad: 65 },
            fromRelative: -9,
            days: 14,
        }),
        fillTilbakedatering({
            contact: daysAgo(4),
            reason: 'Ventetid på legetime',
        }),
        pickHoveddiagnose({
            search: 'Angst',
            select: /Angstlidelse/,
        }),
        addBidiagnose({
            search: 'A03',
            select: /Feber/,
        }),
        addBidiagnose({
            search: 'S95',
            select: /Molluscum contagiosum/,
        }),
        fillAndreSporsmal({
            svangerskapsrelatert: true,
            yrkesskade: true,
            yrkesskadeDato: daysAgo(2),
        }),
        fillMeldinger({
            tilNav: 'Trenger mer penger',
            tilArbeidsgiver: 'Trenger sev-henk pult',
        }),
    )

const verifyAlltheValues = userInteractionsGroup(
    expectPeriode({ type: { grad: 65 }, fromRelative: -9, days: 14 }),
    expectTilbakedatering({ daysAgo: 4, reason: 'VENTETID_LEGETIME' }),
    expectHoveddiagnose('P74 - Angstlidelse'),
    expectBidagnoses(['Feber', 'Molluscum contagiosum']),
    expectAndreSporsmal({ svangerskapsrelatert: true, yrkesskade: true, yrkesskadeDato: daysAgo(2) }),
    expectMeldinger({ tilNav: 'Trenger mer penger', tilArbeidsgiver: 'Trenger sev-henk pult' }),
)

modes.forEach(({ mode }) => {
    test(`${mode}: filling out the form, and returning to main step, should keep all values`, async ({ page }) => {
        await fillAllTheValues(mode)(page)

        await nextStep()(page)

        await expect(page.getByRole('heading', { name: 'Oppsummering sykmelding' })).toBeVisible()

        await verifySignerendeBehandlerFillIfNeeded(mode)(page)

        await previousStep()(page)

        await verifyAlltheValues(page)
    })

    test(`${mode}: filling out the form, saving a draft, and returning to the form, should keep all the values`, async ({
        page,
    }) => {
        await fillAllTheValues(mode)(page)

        await saveDraft()(page)

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

        await verifyAlltheValues(page)
    })

    test(`${mode}: filling out the form, and reloading on kvittering page should restore values`, async ({ page }) => {
        await fillAllTheValues(mode)(page)

        await nextStep()(page)

        await verifySignerendeBehandlerFillIfNeeded(mode)(page)

        await page.reload()

        await verifySummaryPage([
            mode === 'FHIR'
                ? {
                      name: 'Sykmeldingen gjelder',
                      values: ['Espen Eksempel', '21037712323'],
                  }
                : {
                      name: 'Sykmeldingen gjelder',
                      values: ['Ola Nordmann Hansen', '21037712323'],
                  },
            { name: 'Har pasienten flere arbeidsforhold?', values: ['Nei'] },
            { name: 'Periode', values: [new RegExp(toReadableDatePeriod(daysAgo(9), daysAgo(-5)))] },
            { name: 'Periode', values: [/Gradert sykmelding \(65%\)/] },
            { name: 'Dato for tilbakedatering', values: [toReadableDate(daysAgo(4))] },
            { name: 'Grunn for tilbakedatering', values: ['Ventetid på legetime'] },
            { name: 'Hoveddiagnose', values: ['Angstlidelse (P74)ICPC2'] },
            { name: 'Til NAV', values: ['Trenger mer penger'] },
            { name: 'Til arbeidsgiver', values: ['Trenger sev-henk pult'] },
            { name: 'Annen info', values: ['Sykdommen er svangerskapsrelatert'] },
            { name: 'Kan skyldes yrkesskade', values: ['Ja'] },
            { name: 'Dato for yrkesskade', values: [toReadableDate(daysAgo(2))] },
        ])(page)
    })
})
