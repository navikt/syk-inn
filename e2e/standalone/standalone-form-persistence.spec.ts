import { test, expect } from '@playwright/test'
import { toReadableDate, toReadableDatePeriod } from '@lib/date'

import { daysAgo } from '../utils/date-utils'
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

import { launchWithMock } from './actions/standalone-actions'
import {
    continueDraft,
    fillOrgnummer,
    fillTelefonnummer,
    searchPerson,
    startNewSykmelding,
} from './actions/standalone-user-actions'
import { verifySignerendeBehandler } from './actions/standalone-user-verifications'

const fillAllTheValues = userInteractionsGroup(
    launchWithMock('empty', {
        behandler: 'Johan Johansson',
    }),
    searchPerson('21037712323'),
    startNewSykmelding('21037712323'),
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

test('filling out the form, and returning to main step, should keep all values', async ({ page }) => {
    await fillAllTheValues(page)

    await nextStep()(page)

    await fillOrgnummer('112233445')(page)
    await fillTelefonnummer('+47 99887766')(page)

    await expect(page.getByRole('heading', { name: 'Oppsummering sykmelding' })).toBeVisible()

    await verifySignerendeBehandler('123456')(page)

    await previousStep()(page)

    await verifyAlltheValues(page)
})

test('filling out the form, saving a draft, and returning to the form, should keep all the values', async ({
    page,
}) => {
    await fillAllTheValues(page)

    await saveDraft()(page)

    await expect(page.getByRole('searchbox', { name: 'Finn pasient' })).toBeVisible()

    // Make sure the cache/store is clean
    await page.reload()

    await searchPerson('21037712323')(page)
    await continueDraft('21037712323')(page)

    await verifyAlltheValues(page)
})

test('filling out the form, and reloading on kvittering page should restore values', async ({ page }) => {
    await fillAllTheValues(page)

    await nextStep()(page)

    await fillOrgnummer('112233445')(page)
    await fillTelefonnummer('+47 99887766')(page)

    await expect(page.getByRole('heading', { name: 'Oppsummering sykmelding' })).toBeVisible()

    await verifySignerendeBehandler('123456')(page)

    await page.reload()

    await verifySummaryPage([
        { name: 'Sykmeldingen gjelder', values: ['Ola Nordmann Hansen', '21037712323'] },
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
