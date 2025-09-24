import { test, expect } from '@playwright/test'

import { OpprettSykmeldingDocument } from '@queries'
import { toReadableDate, toReadableDatePeriod } from '@lib/date'

import { launchWithMock } from './actions/fhir-actions'
import { daysAgo, inDays, inputDate, today } from './utils/date-utils'
import {
    startNewSykmelding,
    fillPeriodeRelative,
    pickHoveddiagnose,
    submitSykmelding,
    nextStep,
    fillTilbakedatering,
    fillArbeidsforhold,
    fillArsakerTilAktivitetIkkeMulig,
    addBidiagnose,
} from './actions/user-actions'
import { expectGraphQLRequest } from './utils/assertions'
import { getDraftId } from './utils/request-utils'
import { verifySignerendeBehandler, verifySummaryPage } from './actions/user-verifications'
import { userInteractionsGroup } from './utils/actions'

const launchAndStart = userInteractionsGroup(
    launchWithMock('empty'),
    startNewSykmelding({ name: 'Espen Eksempel', fnr: '21037712323' }),
)

test('simple - 100% sykmelding', async ({ page }) => {
    await launchAndStart(page)

    await fillPeriodeRelative({
        type: '100%',
        days: 3,
    })(page)

    await pickHoveddiagnose({ search: 'Angst', select: /Angstlidelse/ })(page)
    await addBidiagnose({ search: 'B600', select: /Babesiose/ })(page)

    await nextStep()(page)
    await verifySignerendeBehandler()(page)

    const request = await submitSykmelding()(page)
    await expectGraphQLRequest(request).toBe(OpprettSykmeldingDocument, {
        draftId: getDraftId(page) ?? 'missing',
        values: {
            hoveddiagnose: { system: 'ICPC2', code: 'P74' },
            bidiagnoser: [{ system: 'ICD10', code: 'B600' }],
            aktivitet: [
                {
                    type: 'AKTIVITET_IKKE_MULIG',
                    fom: today(),
                    tom: inDays(3),
                    aktivitetIkkeMulig: { dummy: true },
                    avventende: null,
                    gradert: null,
                    behandlingsdager: null,
                    reisetilskudd: null,
                    medisinskArsak: {
                        isMedisinskArsak: true,
                    },
                    arbeidsrelatertArsak: {
                        isArbeidsrelatertArsak: false,
                        arbeidsrelaterteArsaker: [],
                        annenArbeidsrelatertArsak: null,
                    },
                },
            ],
            meldinger: { tilNav: null, tilArbeidsgiver: null },
            svangerskapsrelatert: false,
            yrkesskade: { yrkesskade: false, skadedato: null },
            arbeidsforhold: null,
            tilbakedatering: null,
            pasientenSkalSkjermes: false,
        },
    })

    await expect(page.getByRole('heading', { name: 'Kvittering på innsendt sykmelding' })).toBeVisible()
})

test('simple - gradert sykmelding', async ({ page }) => {
    await launchAndStart(page)

    await fillPeriodeRelative({
        type: { grad: 50 },
        days: 3,
    })(page)

    await pickHoveddiagnose({ search: 'Angst', select: /Angstlidelse/ })(page)

    await nextStep()(page)
    await verifySignerendeBehandler()(page)

    const request = await submitSykmelding()(page)
    await expectGraphQLRequest(request).toBe(OpprettSykmeldingDocument, {
        draftId: getDraftId(page) ?? 'missing',
        values: {
            hoveddiagnose: { system: 'ICPC2', code: 'P74' },
            bidiagnoser: [],
            aktivitet: [
                {
                    type: 'GRADERT',
                    fom: today(),
                    tom: inDays(3),
                    gradert: {
                        grad: 50,
                        reisetilskudd: false,
                    },
                    aktivitetIkkeMulig: null,
                    avventende: null,
                    behandlingsdager: null,
                    reisetilskudd: null,
                    medisinskArsak: null,
                    arbeidsrelatertArsak: null,
                },
            ],
            meldinger: { tilNav: null, tilArbeidsgiver: null },
            svangerskapsrelatert: false,
            yrkesskade: { yrkesskade: false, skadedato: null },
            arbeidsforhold: null,
            tilbakedatering: null,
            pasientenSkalSkjermes: false,
        },
    })

    await expect(page.getByRole('heading', { name: 'Kvittering på innsendt sykmelding' })).toBeVisible()
})

test('simple - submit with only default values', async ({ page }) => {
    await launchAndStart(page)

    await test.step('fill only values that are not prefilled (tom, grad)', async () => {
        // Tom is not prefilled
        await page.getByRole('textbox', { name: 'Til og med' }).fill(inputDate(inDays(3)))

        // Grad is not prefilled
        await page.getByRole('textbox', { name: 'Sykmeldingsgrad (%)' }).fill(`60`)
    })

    await nextStep()(page)
    await verifySignerendeBehandler()(page)

    const request = await submitSykmelding()(page)
    await expectGraphQLRequest(request).toBe(OpprettSykmeldingDocument, {
        draftId: getDraftId(page) ?? 'missing',
        values: {
            hoveddiagnose: { system: 'ICPC2', code: 'L73' },
            bidiagnoser: [],
            aktivitet: [
                {
                    type: 'GRADERT',
                    fom: today(),
                    tom: inDays(3),
                    gradert: {
                        grad: 60,
                        reisetilskudd: false,
                    },
                    aktivitetIkkeMulig: null,
                    avventende: null,
                    behandlingsdager: null,
                    reisetilskudd: null,
                    medisinskArsak: null,
                    arbeidsrelatertArsak: null,
                },
            ],
            meldinger: { tilNav: null, tilArbeidsgiver: null },
            svangerskapsrelatert: false,
            yrkesskade: { yrkesskade: false, skadedato: null },
            arbeidsforhold: null,
            tilbakedatering: null,
            pasientenSkalSkjermes: false,
        },
    })

    await expect(page.getByRole('heading', { name: 'Kvittering på innsendt sykmelding' })).toBeVisible()
})

test('optional - multiple bidiagnoser', async ({ page }) => {
    await launchAndStart(page)

    await fillPeriodeRelative({
        type: '100%',
        days: 3,
    })(page)

    await pickHoveddiagnose({ search: 'Angst', select: /Angstlidelse/ })(page)
    await addBidiagnose({ search: 'B600', select: /Babesiose/ })(page)
    await addBidiagnose({ search: 'R772', select: /Alfaføtoproteinabnormitet/ })(page)

    await nextStep()(page)
    await verifySignerendeBehandler()(page)

    const request = await submitSykmelding()(page)
    await expectGraphQLRequest(request).toBe(OpprettSykmeldingDocument, {
        draftId: getDraftId(page) ?? 'missing',
        values: {
            hoveddiagnose: { code: 'P74', system: 'ICPC2' },
            bidiagnoser: [
                { system: 'ICD10', code: 'B600' },
                { system: 'ICD10', code: 'R772' },
            ],
            aktivitet: [
                {
                    type: 'AKTIVITET_IKKE_MULIG',
                    fom: today(),
                    tom: inDays(3),
                    aktivitetIkkeMulig: { dummy: true },
                    avventende: null,
                    gradert: null,
                    behandlingsdager: null,
                    reisetilskudd: null,
                    medisinskArsak: {
                        isMedisinskArsak: true,
                    },
                    arbeidsrelatertArsak: {
                        isArbeidsrelatertArsak: false,
                        arbeidsrelaterteArsaker: [],
                        annenArbeidsrelatertArsak: null,
                    },
                },
            ],
            meldinger: { tilNav: null, tilArbeidsgiver: null },
            svangerskapsrelatert: false,
            yrkesskade: { yrkesskade: false, skadedato: null },
            arbeidsforhold: null,
            tilbakedatering: null,
            pasientenSkalSkjermes: false,
        },
    })

    await expect(page.getByRole('heading', { name: 'Kvittering på innsendt sykmelding' })).toBeVisible()
})

test('optional - should pre-fill bidiagnoser from FHIR @feature-toggle', async ({ page }) => {
    await launchWithMock('empty', {
        SYK_INN_AUTO_BIDIAGNOSER: true,
    })(page)
    await startNewSykmelding({ name: 'Espen Eksempel', fnr: '21037712323' })(page)

    await fillPeriodeRelative({
        type: '100%',
        days: 3,
    })(page)

    await nextStep()(page)
    await verifySignerendeBehandler()(page)

    const request = await submitSykmelding()(page)
    await expectGraphQLRequest(request).toBe(OpprettSykmeldingDocument, {
        draftId: getDraftId(page) ?? 'missing',
        values: {
            // Pre filled from FHIR
            hoveddiagnose: { code: 'L73', system: 'ICPC2' },
            // Pre filled from FHIR
            bidiagnoser: [
                { system: 'ICPC2', code: 'P74' },
                { system: 'ICD10', code: 'A051' },
            ],
            aktivitet: [
                {
                    type: 'AKTIVITET_IKKE_MULIG',
                    fom: today(),
                    tom: inDays(3),
                    aktivitetIkkeMulig: { dummy: true },
                    avventende: null,
                    gradert: null,
                    behandlingsdager: null,
                    reisetilskudd: null,
                    medisinskArsak: {
                        isMedisinskArsak: true,
                    },
                    arbeidsrelatertArsak: {
                        isArbeidsrelatertArsak: false,
                        arbeidsrelaterteArsaker: [],
                        annenArbeidsrelatertArsak: null,
                    },
                },
            ],
            meldinger: { tilNav: null, tilArbeidsgiver: null },
            svangerskapsrelatert: false,
            yrkesskade: { yrkesskade: false, skadedato: null },
            arbeidsforhold: null,
            tilbakedatering: null,
            pasientenSkalSkjermes: false,
        },
    })

    await expect(page.getByRole('heading', { name: 'Kvittering på innsendt sykmelding' })).toBeVisible()
})

test("optional - 'tilbakedatering' is asked and required when fom is 5 days in the past", async ({ page }) => {
    await launchAndStart(page)

    await fillPeriodeRelative({
        type: '100%',
        fromRelative: -5,
        days: 5,
    })(page)
    await fillTilbakedatering({
        contact: daysAgo(2),
        reason: 'Ventetid på legetime',
    })(page)
    await pickHoveddiagnose({ search: 'Angst', select: /Angstlidelse/ })(page)

    await nextStep()(page)
    await verifySignerendeBehandler()(page)

    await verifySummaryPage([
        {
            name: 'Sykmeldingen gjelder',
            values: ['Espen Eksempel', '21037712323'],
        },
        {
            name: 'Har pasienten flere arbeidsforhold?',
            values: ['Nei'],
        },
        {
            name: 'Periode',
            values: [new RegExp(toReadableDatePeriod(daysAgo(5), inDays(0)))],
        },
        {
            name: 'Periode',
            values: [/100% sykmelding/],
        },
        {
            name: 'Hoveddiagnose',
            values: ['Angstlidelse (P74)ICPC2'], // TODO: Hvorfor kommer denne som en linje?
        },
        {
            name: 'Dato for tilbakedatering',
            values: [toReadableDate(daysAgo(2))],
        },
        {
            name: 'Grunn for tilbakedatering',
            values: ['Ventetid på legetime'],
        },
    ])(page)

    const request = await submitSykmelding()(page)

    await expectGraphQLRequest(request).toBe(OpprettSykmeldingDocument, {
        draftId: getDraftId(page) ?? 'missing',
        values: {
            hoveddiagnose: { system: 'ICPC2', code: 'P74' },
            bidiagnoser: [],
            aktivitet: [
                {
                    type: 'AKTIVITET_IKKE_MULIG',
                    fom: daysAgo(5),
                    tom: inDays(0),
                    aktivitetIkkeMulig: { dummy: true },
                    avventende: null,
                    gradert: null,
                    behandlingsdager: null,
                    reisetilskudd: null,
                    medisinskArsak: {
                        isMedisinskArsak: true,
                    },
                    arbeidsrelatertArsak: {
                        isArbeidsrelatertArsak: false,
                        arbeidsrelaterteArsaker: [],
                        annenArbeidsrelatertArsak: null,
                    },
                },
            ],
            tilbakedatering: {
                startdato: daysAgo(2),
                begrunnelse: 'Ventetid på legetime',
            },
            meldinger: { tilNav: null, tilArbeidsgiver: null },
            svangerskapsrelatert: false,
            yrkesskade: { yrkesskade: false, skadedato: null },
            arbeidsforhold: null,
            pasientenSkalSkjermes: false,
        },
    })
})

test('optional - "tilbakedatering" and "Annen årsak" input field is required and part of payload when checked', async ({
    page,
}) => {
    await launchAndStart(page)

    await fillPeriodeRelative({
        type: '100%',
        fromRelative: -5,
        days: 5,
    })(page)
    await fillTilbakedatering({
        contact: daysAgo(2),
        reason: 'Annet',
        otherReason: 'Annen årsak til tilbakedatering',
    })(page)
    await pickHoveddiagnose({ search: 'Angst', select: /Angstlidelse/ })(page)

    await nextStep()(page)
    await verifySignerendeBehandler()(page)

    const request = await submitSykmelding()(page)

    await expectGraphQLRequest(request).toBe(OpprettSykmeldingDocument, {
        draftId: getDraftId(page) ?? 'missing',
        values: {
            hoveddiagnose: { system: 'ICPC2', code: 'P74' },
            bidiagnoser: [],
            aktivitet: [
                {
                    type: 'AKTIVITET_IKKE_MULIG',
                    fom: daysAgo(5),
                    tom: inDays(0),
                    aktivitetIkkeMulig: { dummy: true },
                    avventende: null,
                    gradert: null,
                    behandlingsdager: null,
                    reisetilskudd: null,
                    medisinskArsak: {
                        isMedisinskArsak: true,
                    },
                    arbeidsrelatertArsak: {
                        isArbeidsrelatertArsak: false,
                        arbeidsrelaterteArsaker: [],
                        annenArbeidsrelatertArsak: null,
                    },
                },
            ],
            tilbakedatering: {
                startdato: daysAgo(2),
                begrunnelse: 'Annen årsak til tilbakedatering',
            },
            meldinger: { tilNav: null, tilArbeidsgiver: null },
            svangerskapsrelatert: false,
            yrkesskade: { yrkesskade: false, skadedato: null },
            arbeidsforhold: null,
            pasientenSkalSkjermes: false,
        },
    })
})

test('optional - "har flere arbeidsforhold" should be part of payload if checked', async ({ page }) => {
    await launchAndStart(page)

    await fillArbeidsforhold({
        harFlereArbeidsforhold: true,
        sykmeldtFraArbeidsforhold: 'Test AS',
    })(page)

    await fillPeriodeRelative({
        type: '100%',
        days: 3,
    })(page)

    await pickHoveddiagnose({ search: 'Angst', select: /Angstlidelse/ })(page)

    await nextStep()(page)

    await verifySignerendeBehandler()(page)

    const request = await submitSykmelding()(page)
    await expectGraphQLRequest(request).toBe(OpprettSykmeldingDocument, {
        draftId: getDraftId(page) ?? 'missing',
        values: {
            hoveddiagnose: { system: 'ICPC2', code: 'P74' },
            bidiagnoser: [],
            aktivitet: [
                {
                    type: 'AKTIVITET_IKKE_MULIG',
                    fom: today(),
                    tom: inDays(3),
                    aktivitetIkkeMulig: { dummy: true },
                    avventende: null,
                    gradert: null,
                    behandlingsdager: null,
                    reisetilskudd: null,
                    medisinskArsak: {
                        isMedisinskArsak: true,
                    },
                    arbeidsrelatertArsak: {
                        isArbeidsrelatertArsak: false,
                        arbeidsrelaterteArsaker: [],
                        annenArbeidsrelatertArsak: null,
                    },
                },
            ],
            meldinger: { tilNav: null, tilArbeidsgiver: null },
            svangerskapsrelatert: false,
            yrkesskade: { yrkesskade: false, skadedato: null },
            arbeidsforhold: {
                arbeidsgivernavn: 'Test AS',
            },
            tilbakedatering: null,
            pasientenSkalSkjermes: false,
        },
    })
})

test('optional - when 100%, "arbeidsrelaterte og medisinske årsaker" should be part of payload if checked', async ({
    page,
}) => {
    await launchAndStart(page)

    await fillPeriodeRelative({
        type: '100%',
        days: 3,
    })(page)

    await fillArsakerTilAktivitetIkkeMulig({
        isMedisinsk: true,
        isArbeidsrelatert: true,
        arbeidsrelaterteArsaker: ['tilrettelegging ikke mulig', 'annet'],
        arbeidsrelatertArsakBegrunnelse: 'Annen årsak til aktivitet ikke mulig',
    })(page)

    await pickHoveddiagnose({ search: 'Angst', select: /Angstlidelse/ })(page)

    await nextStep()(page)

    await verifySignerendeBehandler()(page)

    const request = await submitSykmelding()(page)
    await expectGraphQLRequest(request).toBe(OpprettSykmeldingDocument, {
        draftId: getDraftId(page) ?? 'missing',
        values: {
            hoveddiagnose: { system: 'ICPC2', code: 'P74' },
            bidiagnoser: [],
            aktivitet: [
                {
                    type: 'AKTIVITET_IKKE_MULIG',
                    fom: today(),
                    tom: inDays(3),
                    aktivitetIkkeMulig: { dummy: true },
                    avventende: null,
                    gradert: null,
                    behandlingsdager: null,
                    reisetilskudd: null,
                    medisinskArsak: {
                        isMedisinskArsak: true,
                    },
                    arbeidsrelatertArsak: {
                        isArbeidsrelatertArsak: true,
                        arbeidsrelaterteArsaker: ['TILRETTELEGGING_IKKE_MULIG', 'ANNET'],
                        annenArbeidsrelatertArsak: 'Annen årsak til aktivitet ikke mulig',
                    },
                },
            ],
            arbeidsforhold: null,
            meldinger: { tilNav: null, tilArbeidsgiver: null },
            svangerskapsrelatert: false,
            yrkesskade: { yrkesskade: false, skadedato: null },
            tilbakedatering: null,
            pasientenSkalSkjermes: false,
        },
    })
})

test('summary - "skal skjermes" should be part of payload if checked', async ({ page }) => {
    await launchAndStart(page)

    await fillPeriodeRelative({
        type: '100%',
        days: 3,
    })(page)

    await pickHoveddiagnose({ search: 'Angst', select: /Angstlidelse/ })(page)

    await nextStep()(page)
    await verifySignerendeBehandler()(page)

    await page.getByRole('checkbox', { name: 'Pasienten skal skjermes for medisinske opplysninger' }).check()
    const request = await submitSykmelding()(page)

    await expectGraphQLRequest(request).toBe(OpprettSykmeldingDocument, {
        draftId: getDraftId(page) ?? 'missing',
        values: {
            hoveddiagnose: { system: 'ICPC2', code: 'P74' },
            bidiagnoser: [],
            aktivitet: [
                {
                    type: 'AKTIVITET_IKKE_MULIG',
                    fom: today(),
                    tom: inDays(3),
                    aktivitetIkkeMulig: { dummy: true },
                    avventende: null,
                    gradert: null,
                    behandlingsdager: null,
                    reisetilskudd: null,
                    medisinskArsak: {
                        isMedisinskArsak: true,
                    },
                    arbeidsrelatertArsak: {
                        isArbeidsrelatertArsak: false,
                        arbeidsrelaterteArsaker: [],
                        annenArbeidsrelatertArsak: null,
                    },
                },
            ],
            meldinger: { tilNav: null, tilArbeidsgiver: null },
            svangerskapsrelatert: false,
            yrkesskade: { yrkesskade: false, skadedato: null },
            arbeidsforhold: null,
            tilbakedatering: null,
            pasientenSkalSkjermes: true,
        },
    })
})

test('rule outcomes - simple sanity check: fails when submit gets a rule outcome', async ({ page }) => {
    await launchAndStart(page)
    await fillPeriodeRelative({
        type: '100%',
        days: 3,
    })(page)

    await nextStep()(page)
    await verifySignerendeBehandler()(page)

    await submitSykmelding('invalid')(page)
    await expect(
        page.getByRole('heading', { name: 'Sykmeldingen ble ikke sendt inn på grunn av regelsjekk' }),
    ).toBeVisible()
})
