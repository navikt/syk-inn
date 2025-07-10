import { expect, test } from '@playwright/test'

import { toReadableDatePeriod } from '@utils/date'

import { launchWithMock } from './actions/fhir-actions'
import { daysAgo, inDays, inputDate } from './utils/date-utils'
import {
    startNewSykmelding,
    fillPeriodeRelative,
    pickHoveddiagnose,
    submitSykmelding,
    nextStep,
    fillArbeidsforhold,
    fillAndreSporsmal,
    fillMeldinger,
} from './actions/user-actions'
import { verifySignerendeBehandler, verifySummaryPage } from './actions/user-verifications'
import { userInteractionsGroup } from './utils/actions'
import {
    expectAndreSporsmal,
    expectArbeidsforhold,
    expectHoveddiagnose,
    expectMeldinger,
    expectPeriode,
} from './actions/user-form-verification'

test('should be able to duplicate an existing sykmelding with correct values', async ({ page }) => {
    await launchWithMock('empty')(page)
    await startNewSykmelding()(page)

    await userInteractionsGroup(
        fillArbeidsforhold({ harFlereArbeidsforhold: true, sykmeldtFraArbeidsforhold: 'Duplicatiore AS' }),
        fillPeriodeRelative({ type: '100%', fromRelative: -1, days: 14 }),
        pickHoveddiagnose({ search: 'H931', select: /Tinnitus/ }),
        fillAndreSporsmal({
            svangerskapsrelatert: true,
            yrkesskade: true,
            yrkesskadeDato: daysAgo(7),
        }),
        fillMeldinger({
            tilNav: 'Trenger definitivt to sykmeldinger',
            tilArbeidsgiver: 'Dobbelt så mange sykmeldinger!',
        }),
        nextStep(),
        verifySignerendeBehandler(),
        submitSykmelding(),
    )(page)

    await page.getByRole('link', { name: 'Tilbake til pasientoversikt' }).click()
    await page.getByRole('button', { name: 'Dupliser sykmelding' }).click()

    await userInteractionsGroup(
        expectArbeidsforhold({ harFlereArbeidsforhold: true, sykmeldtFraArbeidsforhold: 'Duplicatiore AS' }),
        expectPeriode({ type: '100%', fromRelative: -1, days: 14 }),
        expectHoveddiagnose('H931 - Tinnitus'),
        expectAndreSporsmal({ svangerskapsrelatert: true, yrkesskade: true, yrkesskadeDato: daysAgo(7) }),
        expectMeldinger({
            tilNav: 'Trenger definitivt to sykmeldinger',
            tilArbeidsgiver: 'Dobbelt så mange sykmeldinger!',
        }),
    )(page)

    await fillArbeidsforhold({
        harFlereArbeidsforhold: true,
        sykmeldtFraArbeidsforhold: 'The Other One AB',
    })(page)

    await userInteractionsGroup(nextStep(), verifySignerendeBehandler())(page)

    await verifySummaryPage([
        { name: 'Har pasienten flere arbeidsforhold?', values: ['Ja'] },
        { name: 'Hvilke arbeidsforhold skal pasienten sykmeldes fra?', values: ['The Other One AB'] },
    ])(page)

    await submitSykmelding()(page)
})

test('should be able to forlenge an existing sykmelding with correct values', async ({ page }) => {
    await launchWithMock('empty')(page)
    await startNewSykmelding()(page)

    await userInteractionsGroup(
        fillArbeidsforhold({ harFlereArbeidsforhold: true, sykmeldtFraArbeidsforhold: 'Duplicatiore AS' }),
        fillPeriodeRelative({ type: '100%', fromRelative: 0, days: 14 }),
        pickHoveddiagnose({ search: 'H931', select: /Tinnitus/ }),
        fillAndreSporsmal({
            svangerskapsrelatert: true,
            yrkesskade: true,
            yrkesskadeDato: daysAgo(7),
        }),
        fillMeldinger({
            tilNav: 'Trenger definitivt to sykmeldinger',
            tilArbeidsgiver: 'Dobbelt så mange sykmeldinger!',
        }),
        nextStep(),
        verifySignerendeBehandler(),
        submitSykmelding(),
    )(page)

    await page.getByRole('link', { name: 'Tilbake til pasientoversikt' }).click()
    await page.getByRole('button', { name: 'Forleng sykmeldingen' }).click()

    const periodeRegion = page.getByRole('region', { name: 'Periode' })
    // One day ahead of the previous
    await expect(periodeRegion.getByRole('textbox', { name: 'Fra og med' })).toHaveValue(inputDate(inDays(15)))

    await userInteractionsGroup(
        expectArbeidsforhold({ harFlereArbeidsforhold: true, sykmeldtFraArbeidsforhold: 'Duplicatiore AS' }),
        expectHoveddiagnose('H931 - Tinnitus'),
        expectAndreSporsmal({ svangerskapsrelatert: true, yrkesskade: true, yrkesskadeDato: daysAgo(7) }),
        expectMeldinger({
            tilNav: 'Trenger definitivt to sykmeldinger',
            tilArbeidsgiver: 'Dobbelt så mange sykmeldinger!',
        }),
    )(page)

    // Leave the pre-filled value
    await periodeRegion.getByRole('textbox', { name: 'Til og med' }).fill(inputDate(inDays(28)))

    await userInteractionsGroup(nextStep(), verifySignerendeBehandler())(page)

    await verifySummaryPage([
        { name: 'Har pasienten flere arbeidsforhold?', values: ['Ja'] },
        { name: 'Hvilke arbeidsforhold skal pasienten sykmeldes fra?', values: ['Duplicatiore AS'] },
        { name: 'Periode', values: [`${toReadableDatePeriod(inDays(15), inDays(28))}`] },
    ])(page)

    await submitSykmelding()(page)
})

test('should be able to quickly delete a lot of drafts', async ({ page }) => {
    await launchWithMock('plenty-of-drafts')(page)

    // Verify that we have a lot of drafts
    const drafts = page.getByRole('button', { name: 'Åpne utkast' })
    await expect(drafts).toHaveCount(15)

    await test.step('delete 15 drafts', async () => {
        for (let i = 0; i < 15; i++) {
            await page.getByRole('button', { name: 'Slett utkast' }).nth(0).click()
        }
    })

    await page.waitForLoadState('networkidle')

    await expect(page.getByText('Her var det ingen tidligere sykmeldinger eller utkast')).toBeVisible()
})
