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
    confirmRuleOutcomeSubmit,
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
    await addBidiagnose({ search: 'P17', select: /Tobakkmisbruk/ })(page)

    await nextStep()(page)
    await verifySignerendeBehandler()(page)

    const request = await submitSykmelding()(page)
    await expectGraphQLRequest(request).toBe(OpprettSykmeldingDocument, {
        draftId: getDraftId(page) ?? 'missing',
        force: false,
        values: {
            hoveddiagnose: { system: 'ICPC2', code: 'P74' },
            bidiagnoser: [{ system: 'ICPC2', code: 'P17' }],
            aktivitet: [
                {
                    type: 'AKTIVITET_IKKE_MULIG',
                    fom: today(),
                    tom: inDays(3),
                    aktivitetIkkeMulig: {
                        medisinskArsak: { isMedisinskArsak: true },
                        arbeidsrelatertArsak: {
                            isArbeidsrelatertArsak: false,
                            arbeidsrelaterteArsaker: [],
                            annenArbeidsrelatertArsak: null,
                        },
                    },
                    avventende: null,
                    gradert: null,
                    behandlingsdager: null,
                    reisetilskudd: null,
                },
            ],
            meldinger: { tilNav: null, tilArbeidsgiver: null },
            svangerskapsrelatert: false,
            yrkesskade: { yrkesskade: false, skadedato: null },
            arbeidsforhold: null,
            tilbakedatering: null,
            pasientenSkalSkjermes: false,
            utdypendeSporsmal: {
                utfodringerMedArbeid: null,
                medisinskOppsummering: null,
                hensynPaArbeidsplassen: null,
            },
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
        force: false,
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
                },
            ],
            meldinger: { tilNav: null, tilArbeidsgiver: null },
            svangerskapsrelatert: false,
            yrkesskade: { yrkesskade: false, skadedato: null },
            arbeidsforhold: null,
            tilbakedatering: null,
            pasientenSkalSkjermes: false,
            utdypendeSporsmal: {
                utfodringerMedArbeid: null,
                medisinskOppsummering: null,
                hensynPaArbeidsplassen: null,
            },
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
        force: false,
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
                },
            ],
            meldinger: { tilNav: null, tilArbeidsgiver: null },
            svangerskapsrelatert: false,
            yrkesskade: { yrkesskade: false, skadedato: null },
            arbeidsforhold: null,
            tilbakedatering: null,
            pasientenSkalSkjermes: false,
            utdypendeSporsmal: {
                utfodringerMedArbeid: null,
                medisinskOppsummering: null,
                hensynPaArbeidsplassen: null,
            },
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
    await addBidiagnose({ search: 'P17', select: /Tobakkmisbruk/ })(page)
    await addBidiagnose({ search: 'B80', select: /Jernmangelanemi/ })(page)

    await nextStep()(page)
    await verifySignerendeBehandler()(page)

    const request = await submitSykmelding()(page)
    await expectGraphQLRequest(request).toBe(OpprettSykmeldingDocument, {
        draftId: getDraftId(page) ?? 'missing',
        force: false,
        values: {
            hoveddiagnose: { code: 'P74', system: 'ICPC2' },
            bidiagnoser: [
                { system: 'ICPC2', code: 'P17' },
                { system: 'ICPC2', code: 'B80' },
            ],
            aktivitet: [
                {
                    type: 'AKTIVITET_IKKE_MULIG',
                    fom: today(),
                    tom: inDays(3),
                    aktivitetIkkeMulig: {
                        medisinskArsak: { isMedisinskArsak: true },
                        arbeidsrelatertArsak: {
                            isArbeidsrelatertArsak: false,
                            arbeidsrelaterteArsaker: [],
                            annenArbeidsrelatertArsak: null,
                        },
                    },
                    avventende: null,
                    gradert: null,
                    behandlingsdager: null,
                    reisetilskudd: null,
                },
            ],
            meldinger: { tilNav: null, tilArbeidsgiver: null },
            svangerskapsrelatert: false,
            yrkesskade: { yrkesskade: false, skadedato: null },
            arbeidsforhold: null,
            tilbakedatering: null,
            pasientenSkalSkjermes: false,
            utdypendeSporsmal: {
                utfodringerMedArbeid: null,
                medisinskOppsummering: null,
                hensynPaArbeidsplassen: null,
            },
        },
    })

    await expect(page.getByRole('heading', { name: 'Kvittering på innsendt sykmelding' })).toBeVisible()
})

test('optional - multiple perioder back to back', async ({ page }) => {
    await launchWithMock('empty')(page)
    await startNewSykmelding()(page)

    await fillPeriodeRelative({ nth: 0, type: { grad: 60 }, fromRelative: 0, days: 6 })(page)
    await page.getByRole('button', { name: 'Legg til ny periode' }).click()
    await fillPeriodeRelative({ nth: 1, type: { grad: 80 }, fromRelative: 7, days: 6 })(page)

    await nextStep()(page)
    await verifySignerendeBehandler()(page)

    const request = await submitSykmelding()(page)
    await expectGraphQLRequest(request).toBe(OpprettSykmeldingDocument, {
        draftId: getDraftId(page) ?? 'missing',
        force: false,
        values: {
            arbeidsforhold: null,
            hoveddiagnose: { system: 'ICPC2', code: 'L73' },
            bidiagnoser: [],
            aktivitet: [
                {
                    type: 'GRADERT',
                    fom: '2025-10-17',
                    tom: '2025-10-23',
                    gradert: { grad: 60, reisetilskudd: false },
                    aktivitetIkkeMulig: null,
                    avventende: null,
                    behandlingsdager: null,
                    reisetilskudd: null,
                },
                {
                    type: 'GRADERT',
                    fom: '2025-10-24',
                    tom: '2025-10-30',
                    gradert: { grad: 80, reisetilskudd: false },
                    aktivitetIkkeMulig: null,
                    avventende: null,
                    behandlingsdager: null,
                    reisetilskudd: null,
                },
            ],
            meldinger: { tilNav: null, tilArbeidsgiver: null },
            svangerskapsrelatert: false,
            yrkesskade: { yrkesskade: false, skadedato: null },
            tilbakedatering: null,
            pasientenSkalSkjermes: false,
            utdypendeSporsmal: {
                utfodringerMedArbeid: null,
                medisinskOppsummering: null,
                hensynPaArbeidsplassen: null,
            },
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
        force: false,
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
                    aktivitetIkkeMulig: {
                        medisinskArsak: { isMedisinskArsak: true },
                        arbeidsrelatertArsak: {
                            isArbeidsrelatertArsak: false,
                            arbeidsrelaterteArsaker: [],
                            annenArbeidsrelatertArsak: null,
                        },
                    },
                    avventende: null,
                    gradert: null,
                    behandlingsdager: null,
                    reisetilskudd: null,
                },
            ],
            meldinger: { tilNav: null, tilArbeidsgiver: null },
            svangerskapsrelatert: false,
            yrkesskade: { yrkesskade: false, skadedato: null },
            arbeidsforhold: null,
            tilbakedatering: null,
            pasientenSkalSkjermes: false,
            utdypendeSporsmal: {
                utfodringerMedArbeid: null,
                medisinskOppsummering: null,
                hensynPaArbeidsplassen: null,
            },
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
        force: false,
        values: {
            hoveddiagnose: { system: 'ICPC2', code: 'P74' },
            bidiagnoser: [],
            aktivitet: [
                {
                    type: 'AKTIVITET_IKKE_MULIG',
                    fom: daysAgo(5),
                    tom: inDays(0),
                    aktivitetIkkeMulig: {
                        medisinskArsak: { isMedisinskArsak: true },
                        arbeidsrelatertArsak: {
                            isArbeidsrelatertArsak: false,
                            arbeidsrelaterteArsaker: [],
                            annenArbeidsrelatertArsak: null,
                        },
                    },
                    avventende: null,
                    gradert: null,
                    behandlingsdager: null,
                    reisetilskudd: null,
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
            utdypendeSporsmal: {
                utfodringerMedArbeid: null,
                medisinskOppsummering: null,
                hensynPaArbeidsplassen: null,
            },
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
        force: false,
        values: {
            hoveddiagnose: { system: 'ICPC2', code: 'P74' },
            bidiagnoser: [],
            aktivitet: [
                {
                    type: 'AKTIVITET_IKKE_MULIG',
                    fom: daysAgo(5),
                    tom: inDays(0),
                    aktivitetIkkeMulig: {
                        medisinskArsak: { isMedisinskArsak: true },
                        arbeidsrelatertArsak: {
                            isArbeidsrelatertArsak: false,
                            arbeidsrelaterteArsaker: [],
                            annenArbeidsrelatertArsak: null,
                        },
                    },
                    avventende: null,
                    gradert: null,
                    behandlingsdager: null,
                    reisetilskudd: null,
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
            utdypendeSporsmal: {
                utfodringerMedArbeid: null,
                medisinskOppsummering: null,
                hensynPaArbeidsplassen: null,
            },
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
        force: false,
        values: {
            hoveddiagnose: { system: 'ICPC2', code: 'P74' },
            bidiagnoser: [],
            aktivitet: [
                {
                    type: 'AKTIVITET_IKKE_MULIG',
                    fom: today(),
                    tom: inDays(3),
                    aktivitetIkkeMulig: {
                        medisinskArsak: { isMedisinskArsak: true },
                        arbeidsrelatertArsak: {
                            isArbeidsrelatertArsak: false,
                            arbeidsrelaterteArsaker: [],
                            annenArbeidsrelatertArsak: null,
                        },
                    },
                    avventende: null,
                    gradert: null,
                    behandlingsdager: null,
                    reisetilskudd: null,
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
            utdypendeSporsmal: {
                utfodringerMedArbeid: null,
                medisinskOppsummering: null,
                hensynPaArbeidsplassen: null,
            },
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
        force: false,
        values: {
            hoveddiagnose: { system: 'ICPC2', code: 'P74' },
            bidiagnoser: [],
            aktivitet: [
                {
                    type: 'AKTIVITET_IKKE_MULIG',
                    fom: today(),
                    tom: inDays(3),
                    aktivitetIkkeMulig: {
                        medisinskArsak: { isMedisinskArsak: true },
                        arbeidsrelatertArsak: {
                            isArbeidsrelatertArsak: true,
                            arbeidsrelaterteArsaker: ['TILRETTELEGGING_IKKE_MULIG', 'ANNET'],
                            annenArbeidsrelatertArsak: 'Annen årsak til aktivitet ikke mulig',
                        },
                    },
                    avventende: null,
                    gradert: null,
                    behandlingsdager: null,
                    reisetilskudd: null,
                },
            ],
            arbeidsforhold: null,
            meldinger: { tilNav: null, tilArbeidsgiver: null },
            svangerskapsrelatert: false,
            yrkesskade: { yrkesskade: false, skadedato: null },
            tilbakedatering: null,
            pasientenSkalSkjermes: false,
            utdypendeSporsmal: {
                utfodringerMedArbeid: null,
                medisinskOppsummering: null,
                hensynPaArbeidsplassen: null,
            },
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
        force: false,
        values: {
            hoveddiagnose: { system: 'ICPC2', code: 'P74' },
            bidiagnoser: [],
            aktivitet: [
                {
                    type: 'AKTIVITET_IKKE_MULIG',
                    fom: today(),
                    tom: inDays(3),
                    aktivitetIkkeMulig: {
                        medisinskArsak: { isMedisinskArsak: true },
                        arbeidsrelatertArsak: {
                            isArbeidsrelatertArsak: false,
                            arbeidsrelaterteArsaker: [],
                            annenArbeidsrelatertArsak: null,
                        },
                    },
                    avventende: null,
                    gradert: null,
                    behandlingsdager: null,
                    reisetilskudd: null,
                },
            ],
            meldinger: { tilNav: null, tilArbeidsgiver: null },
            svangerskapsrelatert: false,
            yrkesskade: { yrkesskade: false, skadedato: null },
            arbeidsforhold: null,
            tilbakedatering: null,
            pasientenSkalSkjermes: true,
            utdypendeSporsmal: {
                utfodringerMedArbeid: null,
                medisinskOppsummering: null,
                hensynPaArbeidsplassen: null,
            },
        },
    })
})

test.describe('rule outcomes', () => {
    const launchAndFillBasic = userInteractionsGroup(
        launchAndStart,
        fillPeriodeRelative({ type: '100%', days: 3 }),
        nextStep(),
        verifySignerendeBehandler(),
    )

    test('invalid but functionally expected: should be able to submit læll', async ({ page }) => {
        await launchAndFillBasic(page)
        await submitSykmelding('invalid')(page)

        const confirmationModal = page.getByRole('dialog', { name: 'Vær oppmerksom' })
        await expect(confirmationModal).toBeVisible()

        const request = await confirmRuleOutcomeSubmit(confirmationModal)(page)
        await expectGraphQLRequest(request).toBe(OpprettSykmeldingDocument, {
            draftId: getDraftId(page) ?? 'missing',
            force: true,
            values: {
                hoveddiagnose: { system: 'ICPC2', code: 'L73' },
                bidiagnoser: [],
                aktivitet: [
                    {
                        type: 'AKTIVITET_IKKE_MULIG',
                        fom: today(),
                        tom: inDays(3),
                        aktivitetIkkeMulig: {
                            medisinskArsak: { isMedisinskArsak: true },
                            arbeidsrelatertArsak: {
                                isArbeidsrelatertArsak: false,
                                arbeidsrelaterteArsaker: [],
                                annenArbeidsrelatertArsak: null,
                            },
                        },
                        avventende: null,
                        gradert: null,
                        behandlingsdager: null,
                        reisetilskudd: null,
                    },
                ],
                meldinger: { tilNav: null, tilArbeidsgiver: null },
                svangerskapsrelatert: false,
                yrkesskade: { yrkesskade: false, skadedato: null },
                arbeidsforhold: null,
                tilbakedatering: null,
                pasientenSkalSkjermes: false,
                utdypendeSporsmal: {
                    utfodringerMedArbeid: null,
                    medisinskOppsummering: null,
                    hensynPaArbeidsplassen: null,
                },
            },
        })
        await expect(page.getByRole('heading', { name: 'Kvittering på innsendt sykmelding' })).toBeVisible()
    })

    test('manuell behanlidng and expected: should be able to submit læll', async ({ page }) => {
        await launchAndFillBasic(page)
        await submitSykmelding('manual')(page)

        const confirmationModal = page.getByRole('dialog', { name: 'Vær oppmerksom' })
        await expect(confirmationModal).toBeVisible()

        const request = await confirmRuleOutcomeSubmit(confirmationModal)(page)
        await expectGraphQLRequest(request).toBe(OpprettSykmeldingDocument, {
            draftId: getDraftId(page) ?? 'missing',
            force: true,
            values: {
                hoveddiagnose: { system: 'ICPC2', code: 'L73' },
                bidiagnoser: [],
                aktivitet: [
                    {
                        type: 'AKTIVITET_IKKE_MULIG',
                        fom: today(),
                        tom: inDays(3),
                        aktivitetIkkeMulig: {
                            medisinskArsak: { isMedisinskArsak: true },
                            arbeidsrelatertArsak: {
                                isArbeidsrelatertArsak: false,
                                arbeidsrelaterteArsaker: [],
                                annenArbeidsrelatertArsak: null,
                            },
                        },
                        avventende: null,
                        gradert: null,
                        behandlingsdager: null,
                        reisetilskudd: null,
                    },
                ],
                meldinger: { tilNav: null, tilArbeidsgiver: null },
                svangerskapsrelatert: false,
                yrkesskade: { yrkesskade: false, skadedato: null },
                arbeidsforhold: null,
                tilbakedatering: null,
                pasientenSkalSkjermes: false,
                utdypendeSporsmal: {
                    utfodringerMedArbeid: null,
                    medisinskOppsummering: null,
                    hensynPaArbeidsplassen: null,
                },
            },
        })
        await expect(page.getByRole('heading', { name: 'Kvittering på innsendt sykmelding' })).toBeVisible()
    })

    test('invalid but unexpected: should NOT be able to submit', async ({ page }) => {
        await launchAndFillBasic(page)
        await submitSykmelding('invalid-unexpected')(page)

        await expect(page.getByRole('heading', { name: 'Sykmelding kan ikke sendes inn' })).toBeVisible()
    })

    test('person does not exist in PDL: should NOT be able to submit', async ({ page }) => {
        await launchAndFillBasic(page)
        await submitSykmelding('person-not-found')(page)

        await expect(
            page.getByRole('heading', { name: 'Fant ikke Espen Eksempel (21037712323) i folkeregisteret' }),
        ).toBeVisible()
    })
})
