import { test } from '@playwright/test'

import { launchWithMock } from './actions/fhir-actions'
import { daysAgo } from './utils/date-utils'
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

test('shoud be able to duplicate an existing sykmelding with correct values', async ({ page }) => {
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
