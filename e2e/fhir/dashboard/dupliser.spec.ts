import { expect, test } from '@playwright/test'

import { launchWithMock } from '../actions/fhir-actions'
import { startNewSykmelding } from '../actions/fhir-user-actions'
import { userInteractionsGroup } from '../../utils/actions'
import {
    fillAndreSporsmal,
    fillArbeidsforhold,
    fillMeldinger,
    fillPeriodeRelative,
    fillTilbakedatering,
    nextStep,
    pickHoveddiagnose,
    previousStep,
    submitSykmelding,
} from '../../actions/user-actions'
import { daysAgo } from '../../utils/date-utils'
import { verifySignerendeBehandler } from '../actions/fhir-user-verifications'
import {
    expectAndreSporsmal,
    expectArbeidsforhold,
    expectHoveddiagnose,
    expectMeldinger,
    expectPeriode,
} from '../../actions/user-form-verification'
import { verifySummaryPage } from '../../actions/user-verifications'

test('should be able to duplicate an existing sykmelding with correct values', async ({ page }) => {
    await launchWithMock('empty')(page)
    await startNewSykmelding()(page)

    await userInteractionsGroup(
        fillArbeidsforhold({ harFlereArbeidsforhold: true, sykmeldtFraArbeidsforhold: 'Duplicatiore AS' }),
        fillPeriodeRelative({ type: '100%', fromRelative: -1, days: 14 }),
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
    await page.getByRole('button', { name: 'Dupliser' }).click()

    await userInteractionsGroup(
        expectArbeidsforhold({ harFlereArbeidsforhold: true, sykmeldtFraArbeidsforhold: 'Duplicatiore AS' }),
        expectPeriode({ type: '100%', fromRelative: -1, days: 14 }),
        expectHoveddiagnose('L75 - Brudd lårben/lårhals'),
        expectAndreSporsmal({ svangerskapsrelatert: true, yrkesskade: true, yrkesskadeDato: daysAgo(7) }),
        // Don't copy meldinger during duplication
        expectMeldinger({
            tilNav: null,
            tilArbeidsgiver: null,
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

test('should be able to duplicate an existing sykmelding, go tu summary, and return to form without losing values', async ({
    page,
}) => {
    await launchWithMock('empty')(page)
    await startNewSykmelding()(page)

    await userInteractionsGroup(
        fillArbeidsforhold({ harFlereArbeidsforhold: true, sykmeldtFraArbeidsforhold: 'Duplicatiore AS' }),
        fillPeriodeRelative({ type: '100%', fromRelative: -1, days: 14 }),
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
    await page.getByRole('button', { name: 'Dupliser' }).click()

    await userInteractionsGroup(
        expectArbeidsforhold({ harFlereArbeidsforhold: true, sykmeldtFraArbeidsforhold: 'Duplicatiore AS' }),
        expectPeriode({ type: '100%', fromRelative: -1, days: 14 }),
        expectHoveddiagnose('L75 - Brudd lårben/lårhals'),
        expectAndreSporsmal({ svangerskapsrelatert: true, yrkesskade: true, yrkesskadeDato: daysAgo(7) }),
        // Don't copy meldinger during duplication
        expectMeldinger({
            tilNav: null,
            tilArbeidsgiver: null,
        }),
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

test('should not be possible to extend old sykmelding', async ({ page }) => {
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
