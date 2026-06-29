import { expect, test } from '@playwright/test'

import { toReadableDatePeriod } from '#lib/date'
import { daysAgo, inDays, inputDate } from '#lib/test/date-utils'

import {
    fillArbeidsforhold,
    fillBehandlingsdagerExplanation,
    fillBehandlingsdagerPeriode,
    fillPeriodeRelative,
    fillMeldingTilNav,
    fillYrkesskade,
    fillInnspillTilArbeidsgiver,
    selectSvangerskapsrelatert,
    nextStep,
    pickHoveddiagnose,
    previousStep,
    requestAccessToSykmeldinger,
    submitSykmelding,
    fillReisetilskuddPeriode,
    selectReisetilskuddType,
} from '../../actions/user-actions'
import {
    expectArbeidsforhold,
    expectHoveddiagnose,
    expectInnspillTilArbeidsgiver,
    expectMeldingTilNav,
    expectPeriode,
    expectSvangerskapsrelatert,
    expectYrkesskade,
} from '../../actions/user-form-verification'
import { verifySummaryPage } from '../../actions/user-verifications'
import { userInteractionsGroup } from '../../utils/actions'
import { verifyNoHorizontalScroll } from '../../utils/assertions'
import { launchWithMock } from '../actions/fhir-actions'
import { startNewAlternateSykmelding, startNewSykmelding } from '../actions/fhir-user-actions'
import { verifySignerendeBehandler } from '../actions/fhir-user-verifications'

test('should be able to forlenge an existing sykmelding with correct values', async ({ page }) => {
    await launchWithMock('empty')(page)
    await startNewSykmelding()(page)

    await userInteractionsGroup(
        fillArbeidsforhold({ harFlereArbeidsforhold: true, sykmeldtFraArbeidsforhold: 'Duplicatiore AS' }),
        fillPeriodeRelative({ type: '100%', fromRelative: 0, days: 14 }),
        pickHoveddiagnose({ search: 'L75', select: /Brudd lårben/ }),
        selectSvangerskapsrelatert(true),
        fillYrkesskade({ yrkesskade: true, yrkesskadeDato: daysAgo(7) }),
        fillMeldingTilNav('Trenger definitivt to sykmeldinger'),
        fillInnspillTilArbeidsgiver('Dobbelt så mange sykmeldinger!'),
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
        expectSvangerskapsrelatert(true),
        expectYrkesskade({ yrkesskade: true, yrkesskadeDato: daysAgo(7) }),
        // Don't copy meldinger during forlengelse
        expectMeldingTilNav(null),
        expectInnspillTilArbeidsgiver(null),
    )(page)

    // Leave the pre-filled value
    await periodeRegion.getByRole('textbox', { name: 'Til og med' }).fill(inputDate(inDays(28)))

    await userInteractionsGroup(nextStep(), verifySignerendeBehandler())(page)

    await verifySummaryPage([
        { name: 'Har pasienten flere arbeidsgivere?', values: ['Ja'] },
        { name: 'Hvilken arbeidsgiver skal pasienten sykmeldes fra?', values: ['Duplicatiore AS'] },
        { name: 'Periode', values: [new RegExp(toReadableDatePeriod(inDays(15), inDays(28)))] },
    ])(page)

    await submitSykmelding()(page)
})

test('should be able to forlenge an existing behandlingsdager-sykmelding with correct values @feature-toggle', async ({
    page,
}) => {
    await launchWithMock('empty', { SYK_INN_SYKMELDING_BEHANDLINGSDAGER: true })(page)
    await startNewAlternateSykmelding('BEHANDLINGSDAGER')(page)

    await userInteractionsGroup(
        fillBehandlingsdagerPeriode({ fromRelative: 0, days: 14 }),
        fillBehandlingsdagerExplanation('Foo baz bar'),
        pickHoveddiagnose({ search: 'L75', select: /Brudd lårben/ }),
        selectSvangerskapsrelatert(true),
        fillYrkesskade({ yrkesskade: true, yrkesskadeDato: daysAgo(7) }),
        fillInnspillTilArbeidsgiver('Dobbelt så mange sykmeldinger!'),
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
        expectHoveddiagnose('L75 - Brudd lårben/lårhals'),
        expectSvangerskapsrelatert(true),
        expectYrkesskade({ yrkesskade: true, yrkesskadeDato: daysAgo(7) }),
        // Don't copy meldinger during forlengelse
        expectInnspillTilArbeidsgiver(null),
    )(page)

    await fillBehandlingsdagerExplanation('Lorem ipsum')(page)

    // Leave the pre-filled value
    await periodeRegion.getByRole('textbox', { name: 'Til og med' }).fill(inputDate(inDays(28)))

    await userInteractionsGroup(nextStep(), verifySignerendeBehandler())(page)

    await verifySummaryPage([
        { name: 'Periode', values: [new RegExp(toReadableDatePeriod(inDays(15), inDays(28)))] },
        { name: 'Periode', values: [/Sykmelding med behandlingsdager/] },
        { name: 'Til NAV', values: ['Lorem ipsum'] },
    ])(page)

    await submitSykmelding()(page)
})

test('should be able to forlenge an existing reisetilskudd-sykmelding with correct values', async ({ page }) => {
    await launchWithMock('empty')(page)
    await startNewAlternateSykmelding('REISETILSKUDD')(page)

    await userInteractionsGroup(
        fillReisetilskuddPeriode({ fromRelative: 0, days: 14 }),
        selectReisetilskuddType({ grad: 45 }),
        pickHoveddiagnose({ search: 'L75', select: /Brudd lårben/ }),
        selectSvangerskapsrelatert(true),
        fillYrkesskade({ yrkesskade: true, yrkesskadeDato: daysAgo(7) }),
        fillInnspillTilArbeidsgiver('Dobbelt så mange sykmeldinger!'),
        verifyNoHorizontalScroll(),
        nextStep(),
        verifySignerendeBehandler(),
        verifyNoHorizontalScroll(),
        submitSykmelding(),
    )(page)

    await page.getByRole('button', { name: 'Tilbake til pasientoversikt' }).click()
    await page.getByRole('button', { name: 'Forlenge' }).click()

    const periodeRegion = page.getByRole('region', { name: 'Periode for reisetilskudd' })
    // One day ahead of the previous
    await expect(periodeRegion.getByRole('textbox', { name: 'Fra og med' })).toHaveValue(inputDate(inDays(15)))

    await userInteractionsGroup(
        expectHoveddiagnose('L75 - Brudd lårben/lårhals'),
        expectSvangerskapsrelatert(true),
        expectYrkesskade({ yrkesskade: true, yrkesskadeDato: daysAgo(7) }),
        // Don't copy meldinger during forlengelse
        expectInnspillTilArbeidsgiver(null),
    )(page)

    // Leave the pre-filled value
    await periodeRegion.getByRole('textbox', { name: 'Til og med' }).fill(inputDate(inDays(28)))

    await expectPeriode({ type: { reisetilskudd: true, grad: 45 }, fromRelative: 15, days: 13 })(page)

    await userInteractionsGroup(nextStep(), verifySignerendeBehandler())(page)

    await verifySummaryPage([
        { name: 'Periode', values: [new RegExp(toReadableDatePeriod(inDays(15), inDays(28)))] },
        { name: 'Periode', values: [/Gradert sykmelding \(45%\), med reisetilskudd/] },
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
        selectSvangerskapsrelatert(true),
        fillYrkesskade({ yrkesskade: true, yrkesskadeDato: daysAgo(7) }),
        fillMeldingTilNav('Trenger definitivt to sykmeldinger'),
        fillInnspillTilArbeidsgiver('Dobbelt så mange sykmeldinger!'),
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
        expectSvangerskapsrelatert(true),
        expectYrkesskade({ yrkesskade: true, yrkesskadeDato: daysAgo(7) }),
        // Don't copy meldinger during forlengelse
        expectMeldingTilNav(null),
        expectInnspillTilArbeidsgiver(null),
    )(page)

    // Leave the pre-filled value
    await periodeRegion.getByRole('textbox', { name: 'Til og med' }).fill(inputDate(inDays(28)))
    await userInteractionsGroup(nextStep(), verifySignerendeBehandler())(page)
    await previousStep()(page)

    await expectPeriode({ type: '100%', fromRelative: 15, days: 13 })(page)
})
