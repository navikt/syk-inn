import { expect, test } from '@playwright/test'

import { toReadableDatePeriod } from '#lib/date'
import { daysAgo, inDays } from '#lib/test/date-utils'

import {
    fillArbeidsforhold,
    fillBehandlingsdagerExplanation,
    fillBehandlingsdagerPeriode,
    fillMeldingTilNav,
    fillInnspillTilArbeidsgiver,
    fillPeriodeRelative,
    fillTilbakedatering,
    nextStep,
    pickHoveddiagnose,
    previousStep,
    selectSvangerskapsrelatert,
    submitSykmelding,
    fillYrkesskade,
} from '../../actions/user-actions'
import {
    expectSvangerskapsrelatert,
    expectYrkesskade,
    expectArbeidsforhold,
    expectHoveddiagnose,
    expectPeriode,
    expectMeldingTilNav,
    expectInnspillTilArbeidsgiver,
} from '../../actions/user-form-verification'
import { verifySummaryPage } from '../../actions/user-verifications'
import { userInteractionsGroup } from '../../utils/actions'
import { verifyNoHorizontalScroll } from '../../utils/assertions'
import { launchWithMock } from '../actions/fhir-actions'
import { startNewAlternateSykmelding, startNewSykmelding } from '../actions/fhir-user-actions'
import { verifySignerendeBehandler } from '../actions/fhir-user-verifications'

test('should be able to dupliser (from dashboard) an existing sykmelding with correct values', async ({ page }) => {
    await launchWithMock('empty')(page)
    await startNewSykmelding()(page)

    await userInteractionsGroup(
        fillArbeidsforhold({ harFlereArbeidsforhold: true, sykmeldtFraArbeidsforhold: 'Duplicatiore AS' }),
        fillPeriodeRelative({ type: '100%', fromRelative: -1, days: 14 }),
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
    await page.getByRole('button', { name: 'Dupliser' }).click()

    await userInteractionsGroup(
        expectArbeidsforhold({ harFlereArbeidsforhold: true, sykmeldtFraArbeidsforhold: 'Duplicatiore AS' }),
        expectPeriode({ type: '100%', fromRelative: -1, days: 14 }),
        expectHoveddiagnose('L75 - Brudd lårben/lårhals'),
        expectSvangerskapsrelatert(true),
        expectYrkesskade({ yrkesskade: true, yrkesskadeDato: daysAgo(7) }),
        // Don't copy meldinger during duplication
        expectMeldingTilNav(null),
        expectInnspillTilArbeidsgiver(null),
        verifyNoHorizontalScroll(),
    )(page)

    await fillArbeidsforhold({
        harFlereArbeidsforhold: true,
        sykmeldtFraArbeidsforhold: 'The Other One AB',
    })(page)

    await userInteractionsGroup(nextStep(), verifySignerendeBehandler())(page)

    await verifySummaryPage([
        { name: 'Har pasienten flere arbeidsgivere?', values: ['Ja'] },
        { name: 'Hvilken arbeidsgiver skal pasienten sykmeldes fra?', values: ['The Other One AB'] },
    ])(page)

    await submitSykmelding()(page)
})

test('should be able to dupliser behandlingsdager (from dashboard) @feature-toggle', async ({ page }) => {
    await launchWithMock('empty', { SYK_INN_SYKMELDING_BEHANDLINGSDAGER: true })(page)
    await startNewAlternateSykmelding('BEHANDLINGSDAGER')(page)

    await userInteractionsGroup(
        fillBehandlingsdagerPeriode({ fromRelative: -1, days: 14 }),
        fillBehandlingsdagerExplanation('Kort test-forklaring'),
        pickHoveddiagnose({ search: 'L75', select: /Brudd lårben/ }),
        fillInnspillTilArbeidsgiver('Dobbelt så mange sykmeldinger!'),
        selectSvangerskapsrelatert(true),
        fillYrkesskade({ yrkesskade: true, yrkesskadeDato: daysAgo(7) }),
        verifyNoHorizontalScroll(),
        nextStep(),
        verifySignerendeBehandler(),
        verifyNoHorizontalScroll(),
        submitSykmelding(),
    )(page)

    await page.getByRole('button', { name: 'Tilbake til pasientoversikt' }).click()
    await page.getByRole('button', { name: 'Dupliser' }).click()

    await userInteractionsGroup(
        expectPeriode({ type: { behandlingsdager: 3 }, fromRelative: -1, days: 14 }),
        expectHoveddiagnose('L75 - Brudd lårben/lårhals'),
        expectSvangerskapsrelatert(true),
        expectYrkesskade({ yrkesskade: true, yrkesskadeDato: daysAgo(7) }),
        // Don't copy tilArbeidsgiver during duplication
        expectInnspillTilArbeidsgiver(null),
        verifyNoHorizontalScroll(),
    )(page)

    await fillBehandlingsdagerExplanation('Annen forklaring')(page)

    await userInteractionsGroup(nextStep(), verifySignerendeBehandler())(page)

    await verifySummaryPage([
        { name: 'Periode', values: [new RegExp(toReadableDatePeriod(inDays(-1), inDays(13)))] },
        { name: 'Periode', values: [/Sykmelding med behandlingsdager/] },
        { name: 'Til NAV', values: ['Annen forklaring'] },
    ])(page)

    await submitSykmelding()(page)
})

test('should be able to dupliser (from dashboard) an existing sykmelding, go to summary, and return to form without losing values', async ({
    page,
}) => {
    await launchWithMock('empty')(page)
    await startNewSykmelding()(page)

    await userInteractionsGroup(
        fillArbeidsforhold({ harFlereArbeidsforhold: true, sykmeldtFraArbeidsforhold: 'Duplicatiore AS' }),
        fillPeriodeRelative({ type: '100%', fromRelative: -1, days: 14 }),
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
    await page.getByRole('button', { name: 'Dupliser' }).click()

    await userInteractionsGroup(
        expectArbeidsforhold({ harFlereArbeidsforhold: true, sykmeldtFraArbeidsforhold: 'Duplicatiore AS' }),
        expectPeriode({ type: '100%', fromRelative: -1, days: 14 }),
        expectHoveddiagnose('L75 - Brudd lårben/lårhals'),
        expectSvangerskapsrelatert(true),
        expectYrkesskade({ yrkesskade: true, yrkesskadeDato: daysAgo(7) }),
        // Don't copy meldinger during duplication
        expectInnspillTilArbeidsgiver(null),
        expectMeldingTilNav(null),
    )(page)

    await fillArbeidsforhold({
        harFlereArbeidsforhold: true,
        sykmeldtFraArbeidsforhold: 'The Other One AB',
    })(page)

    await userInteractionsGroup(nextStep(), verifySignerendeBehandler())(page)

    await previousStep()(page)

    await expectPeriode({ type: '100%', fromRelative: -1, days: 14 })(page)
    await expectArbeidsforhold({ harFlereArbeidsforhold: true, sykmeldtFraArbeidsforhold: 'The Other One AB' })(page)
})

test('should not be possible to dupliser (from dashboard) old sykmelding', async ({ page }) => {
    await launchWithMock('empty')(page)
    await startNewSykmelding()(page)

    await userInteractionsGroup(
        fillPeriodeRelative({ type: '100%', fromRelative: -35, days: 5 }),
        fillTilbakedatering({
            contact: daysAgo(4),
            reason: 'Ventetid på legetime',
        }),
        pickHoveddiagnose({ search: 'L75', select: /Brudd lårben/ }),
        nextStep(),
        verifySignerendeBehandler(),
        submitSykmelding(),
    )(page)

    await page.getByRole('button', { name: 'Tilbake til pasientoversikt' }).click()

    await expect(page.getByRole('button', { name: 'Forleng' })).not.toBeVisible()
})
