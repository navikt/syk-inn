import { test, expect } from '@playwright/test'

import { launchWithMock } from './actions/fhir-actions'
import { daysAgo } from './utils/date-utils'
import {
    startNewSykmelding,
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
} from './actions/user-actions'
import { userInteractionsGroup } from './utils/actions'
import { verifySignerendeBehandler } from './actions/user-verifications'
import {
    expectAndreSporsmal,
    expectBidagnoses,
    expectHoveddiagnose,
    expectMeldinger,
    expectPeriode,
    expectTilbakedatering,
} from './actions/user-form-verification'

const fillAllTheValues = userInteractionsGroup(
    launchWithMock('normal'),
    startNewSykmelding({ name: 'Espen Eksempel', fnr: '21037712323' }),
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
        search: 'B600',
        select: /Babesiose/,
    }),
    addBidiagnose({
        search: 'R772',
        select: /Alfaføtoproteinabnormitet/,
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
    expectBidagnoses(['Babesiose', 'Alfaføtoproteinabnormitet']),
    expectAndreSporsmal({ svangerskapsrelatert: true, yrkesskade: true, yrkesskadeDato: daysAgo(2) }),
    expectMeldinger({ tilNav: 'Trenger mer penger', tilArbeidsgiver: 'Trenger sev-henk pult' }),
)

test('filling out the form, and returning to main step, should keep all values', async ({ page }) => {
    await fillAllTheValues(page)

    await nextStep()(page)

    await expect(page.getByRole('heading', { name: 'Oppsummering sykmelding' })).toBeVisible()

    await verifySignerendeBehandler()(page)

    await previousStep()(page)

    await verifyAlltheValues(page)
})

test('filling out the form, saving a draft, and returning to the form, should keep all the values', async ({
    page,
}) => {
    await fillAllTheValues(page)

    await saveDraft()(page)

    await expect(page.getByRole('region', { name: 'Tidligere sykmeldinger og utkast' })).toBeVisible()

    // Make sure the cache/store is clean
    await page.reload()

    await page
        .getByRole('region', { name: 'Tidligere sykmeldinger og utkast' })
        .getByRole('button', { name: 'Åpne utkast' })
        .first()
        .click()

    await verifyAlltheValues(page)
})
