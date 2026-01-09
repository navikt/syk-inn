import { expect, test } from '@playwright/test'
import { toReadableDatePeriod } from '@lib/date'
import { daysAgo, inDays, inputDate } from '@lib/test/date-utils'

import { launchWithMock } from '../actions/fhir-actions'
import { startNewSykmelding } from '../actions/fhir-user-actions'
import { userInteractionsGroup } from '../../utils/actions'
import {
    fillAndreSporsmal,
    fillArbeidsforhold,
    fillMeldinger,
    fillPeriodeRelative,
    nextStep,
    pickHoveddiagnose,
    previousStep,
    requestAccessToSykmeldinger,
    submitSykmelding,
} from '../../actions/user-actions'
import { verifySignerendeBehandler } from '../actions/fhir-user-verifications'
import {
    expectAndreSporsmal,
    expectArbeidsforhold,
    expectHoveddiagnose,
    expectMeldinger,
    expectPeriode,
} from '../../actions/user-form-verification'
import { verifySummaryPage } from '../../actions/user-verifications'
import { verifyNoHorizontalScroll } from '../../utils/assertions'

test('should be able to forlenge an existing sykmelding with correct values', async ({ page }) => {
    await launchWithMock('empty')(page)
    await requestAccessToSykmeldinger()(page)
    await startNewSykmelding()(page)

    await userInteractionsGroup(
        fillArbeidsforhold({ harFlereArbeidsforhold: true, sykmeldtFraArbeidsforhold: 'Duplicatiore AS' }),
        fillPeriodeRelative({ type: '100%', fromRelative: 0, days: 14 }),
        pickHoveddiagnose({ search: 'L75', select: /Brudd lårben/ }),
        fillAndreSporsmal({
            svangerskapsrelatert: true,
            yrkesskade: true,
            yrkesskadeDato: daysAgo(7),
        }),
        fillMeldinger({
            tilNav: 'Trenger definitivt to sykmeldinger',
            tilArbeidsgiver: 'Dobbelt så mange sykmeldinger!',
        }),
        verifyNoHorizontalScroll(),
        nextStep(),
        verifySignerendeBehandler(),
        verifyNoHorizontalScroll(),
        submitSykmelding(),
    )(page)

    await page.getByRole('button', { name: 'Tilbake til pasientoversikt' }).click()
    await page.getByRole('button', { name: 'Forlenge' }).click()

    const periodeRegion = page.getByRole('region', { name: 'Periode' })
    // One day ahead of the previous
    await expect(periodeRegion.getByRole('textbox', { name: 'Fra og med' })).toHaveValue(inputDate(inDays(15)))

    await userInteractionsGroup(
        expectArbeidsforhold({ harFlereArbeidsforhold: true, sykmeldtFraArbeidsforhold: 'Duplicatiore AS' }),
        expectHoveddiagnose('L75 - Brudd lårben/lårhals'),
        expectAndreSporsmal({ svangerskapsrelatert: true, yrkesskade: true, yrkesskadeDato: daysAgo(7) }),
        // Don't copy meldinger during forlengelse
        expectMeldinger({
            tilNav: null,
            tilArbeidsgiver: null,
        }),
    )(page)

    // Leave the pre-filled value
    await periodeRegion.getByRole('textbox', { name: 'Til og med' }).fill(inputDate(inDays(28)))

    await userInteractionsGroup(nextStep(), verifySignerendeBehandler())(page)

    await verifySummaryPage([
        { name: 'Har pasienten flere arbeidsforhold?', values: ['Ja'] },
        { name: 'Hvilket arbeidsforhold skal pasienten sykmeldes fra?', values: ['Duplicatiore AS'] },
        { name: 'Periode', values: [new RegExp(toReadableDatePeriod(inDays(15), inDays(28)))] },
    ])(page)

    await submitSykmelding()(page)
})

test('should be able to forleng a sykmelding, go to summary, and return to form without losing values', async ({
    page,
}) => {
    await launchWithMock('empty')(page)
    await requestAccessToSykmeldinger()(page)
    await startNewSykmelding()(page)

    await userInteractionsGroup(
        fillArbeidsforhold({ harFlereArbeidsforhold: true, sykmeldtFraArbeidsforhold: 'Duplicatiore AS' }),
        fillPeriodeRelative({ type: '100%', fromRelative: 0, days: 14 }),
        pickHoveddiagnose({ search: 'L75', select: /Brudd lårben/ }),
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

    await page.getByRole('button', { name: 'Tilbake til pasientoversikt' }).click()
    await page.getByRole('button', { name: 'Forlenge' }).click()

    const periodeRegion = page.getByRole('region', { name: 'Periode' })
    // One day ahead of the previous
    await expect(periodeRegion.getByRole('textbox', { name: 'Fra og med' })).toHaveValue(inputDate(inDays(15)))

    await userInteractionsGroup(
        expectArbeidsforhold({ harFlereArbeidsforhold: true, sykmeldtFraArbeidsforhold: 'Duplicatiore AS' }),
        expectHoveddiagnose('L75 - Brudd lårben/lårhals'),
        expectAndreSporsmal({ svangerskapsrelatert: true, yrkesskade: true, yrkesskadeDato: daysAgo(7) }),
        // Don't copy meldinger during forlengelse
        expectMeldinger({
            tilNav: null,
            tilArbeidsgiver: null,
        }),
    )(page)

    // Leave the pre-filled value
    await periodeRegion.getByRole('textbox', { name: 'Til og med' }).fill(inputDate(inDays(28)))
    await userInteractionsGroup(nextStep(), verifySignerendeBehandler())(page)
    await previousStep()(page)

    await expectPeriode({ type: '100%', fromRelative: 15, days: 13 })(page)
})
