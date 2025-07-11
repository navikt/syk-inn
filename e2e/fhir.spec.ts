import { test, expect } from '@playwright/test'

import { OpprettSykmeldingDocument } from '@queries'
import { toReadableDate, toReadableDatePeriod } from '@utils/date'

import { launchWithMock } from './actions/fhir-actions'
import { daysAgo, inDays, inputDate, today } from './utils/date-utils'
import {
    startNewSykmelding,
    editHoveddiagnose,
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

test('100% sykmelding', async ({ page }) => {
    await launchWithMock()(page)
    await startNewSykmelding({ name: 'Espen Eksempel', fnr: '21037712323' })(page)

    await fillArbeidsforhold({
        harFlereArbeidsforhold: false,
    })(page)

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

test('gradert sykmelding', async ({ page }) => {
    await launchWithMock()(page)
    await startNewSykmelding({ name: 'Espen Eksempel', fnr: '21037712323' })(page)

    await fillArbeidsforhold({
        harFlereArbeidsforhold: false,
    })(page)

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

test('shall be able to edit diagnose', async ({ page }) => {
    await launchWithMock()(page)
    await startNewSykmelding({ name: 'Espen Eksempel', fnr: '21037712323' })(page)

    await fillArbeidsforhold({
        harFlereArbeidsforhold: false,
    })(page)

    await fillPeriodeRelative({
        type: '100%',
        days: 3,
    })(page)

    const diagnoseRegion = await pickHoveddiagnose({ search: 'Angst', select: /Angstlidelse/ })(page)
    await editHoveddiagnose({ search: 'D290', select: /D290/ })(diagnoseRegion)

    await nextStep()(page)
    await verifySignerendeBehandler()(page)

    const request = await submitSykmelding()(page)
    await expectGraphQLRequest(request).toBe(OpprettSykmeldingDocument, {
        draftId: getDraftId(page) ?? 'missing',
        values: {
            hoveddiagnose: { code: 'D290', system: 'ICD10' },
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
            pasientenSkalSkjermes: false,
        },
    })

    await expect(page.getByRole('heading', { name: 'Kvittering på innsendt sykmelding' })).toBeVisible()
})

test('multiple bidiagnoser', async ({ page }) => {
    await launchWithMock()(page)
    await startNewSykmelding({ name: 'Espen Eksempel', fnr: '21037712323' })(page)

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

test('submit with only default values', async ({ page }) => {
    await launchWithMock()(page)
    await startNewSykmelding({ name: 'Espen Eksempel', fnr: '21037712323' })(page)

    // Tom is not prefilled
    await page.getByRole('textbox', { name: 'Til og med' }).fill(inputDate(inDays(3)))

    // Grad is not prefilled
    await page.getByRole('textbox', { name: 'Sykmeldingsgrad (%)' }).fill(`60`)

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

test("should be asked about 'tilbakedatering' when fom is 5 days in the past", async ({ page }) => {
    await launchWithMock()(page)
    await startNewSykmelding({ name: 'Espen Eksempel', fnr: '21037712323' })(page)

    await fillArbeidsforhold({
        harFlereArbeidsforhold: false,
    })(page)

    await fillPeriodeRelative({
        type: '100%',
        fromRelative: -5,
        days: 5,
    })(page)
    await fillTilbakedatering({
        contact: daysAgo(2),
        reason: 'Ferie eller noe',
    })(page)
    await pickHoveddiagnose({ search: 'Angst', select: /Angstlidelse/ })(page)

    await nextStep()(page)
    await verifySignerendeBehandler()(page)

    await verifySummaryPage([
        {
            name: 'Navn',
            values: ['Espen Eksempel'],
        },
        { name: 'Fødselsnummer', values: ['21037712323'] },
        {
            name: 'Har pasienten flere arbeidsforhold?',
            values: ['Nei'],
        },
        {
            name: 'Periode',
            values: [`${toReadableDatePeriod(daysAgo(5), inDays(0))}`],
        },
        {
            name: 'Mulighet for arbeid',
            values: ['Aktivitet ikke mulig (100% sykmeldt)'],
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
            values: ['Ferie eller noe'],
        },
        {
            name: 'Til NAV',
            values: ['Ingen melding'],
        },
        {
            name: 'Til arbeidsgiver',
            values: ['Ingen melding'],
        },
        {
            name: 'Svangerskapsrelatert',
            values: ['Nei'],
        },
        {
            name: 'Yrkesskade',
            values: ['Nei'],
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
                begrunnelse: 'Ferie eller noe',
            },
            meldinger: { tilNav: null, tilArbeidsgiver: null },
            svangerskapsrelatert: false,
            yrkesskade: { yrkesskade: false, skadedato: null },
            arbeidsforhold: null,
            pasientenSkalSkjermes: false,
        },
    })
})

test('"skal skjermes" should be part of payload if checked', async ({ page }) => {
    await launchWithMock()(page)
    await startNewSykmelding({ name: 'Espen Eksempel', fnr: '21037712323' })(page)

    await fillArbeidsforhold({
        harFlereArbeidsforhold: false,
    })(page)

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

test('"har flere arbeidsforhold" should be part of payload if checked', async ({ page }) => {
    await launchWithMock()(page)
    await startNewSykmelding({ name: 'Espen Eksempel', fnr: '21037712323' })(page)

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

test('"arbeidsrelaterte og medisinske årsaker" should be part of payload if checked', async ({ page }) => {
    await launchWithMock()(page)
    await startNewSykmelding({ name: 'Espen Eksempel', fnr: '21037712323' })(page)

    await fillPeriodeRelative({
        type: '100%',
        days: 3,
    })(page)

    await fillArsakerTilAktivitetIkkeMulig({})(page)

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
