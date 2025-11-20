import { expect, Page, test } from '@playwright/test'
import { OpprettSykmeldingDocument, OpprettSykmeldingMetaInput } from '@queries'
import { toReadableDate, toReadableDatePeriod } from '@lib/date'

import {
    addBidiagnose,
    confirmRuleOutcomeSubmit,
    fillArbeidsforhold,
    fillArsakerTilAktivitetIkkeMulig,
    fillPeriodeRelative,
    fillTilbakedatering,
    nextStep,
    pickHoveddiagnose,
    submitSykmelding,
} from '../actions/user-actions'
import { expectGraphQLRequest } from '../utils/assertions'
import { daysAgo, inDays, today } from '../utils/date-utils'
import { userInteractionsGroup } from '../utils/actions'
import { verifySummaryPage } from '../actions/user-verifications'
import * as fhirActions from '../fhir/actions/fhir-user-actions'
import * as fhirUserVerification from '../fhir/actions/fhir-user-verifications'
import * as standaloneActions from '../standalone/actions/standalone-user-actions'
import * as standaloneUserVerification from '../standalone/actions/standalone-user-verifications'

import { Modes, modes, launchMode, onMode } from './modes'

modes.forEach(({ mode }) => {
    test(`${mode}: simple - 100% sykmelding`, async ({ page }) => {
        await launchAndStart(mode)(page)

        await fillPeriodeRelative({
            type: '100%',
            days: 3,
        })(page)

        await pickHoveddiagnose({ search: 'Angst', select: /Angstlidelse/ })(page)
        await addBidiagnose({ search: 'P17', select: /Tobakkmisbruk/ })(page)

        await nextStep()(page)
        await expectSignerendeBehandler(mode)(page)

        const { request, draftId } = await submitSykmelding()(page)
        await expectGraphQLRequest(request).toBe(OpprettSykmeldingDocument, {
            draftId: draftId,
            meta: expectedSykmeldingMeta(mode),
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

    test(`${mode}: simple - gradert sykmelding`, async ({ page }) => {
        await launchAndStart(mode)(page)

        await fillPeriodeRelative({
            type: { grad: 50 },
            days: 3,
        })(page)

        await pickHoveddiagnose({ search: 'Angst', select: /Angstlidelse/ })(page)

        await nextStep()(page)
        await expectSignerendeBehandler(mode)(page)

        const { request, draftId } = await submitSykmelding()(page)
        await expectGraphQLRequest(request).toBe(OpprettSykmeldingDocument, {
            draftId: draftId,
            meta: expectedSykmeldingMeta(mode),
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

    test(`${mode}: optional - multiple bidiagnoser`, async ({ page }) => {
        await launchAndStart(mode)(page)

        await fillPeriodeRelative({
            type: '100%',
            days: 3,
        })(page)

        await pickHoveddiagnose({ search: 'Angst', select: /Angstlidelse/ })(page)
        await addBidiagnose({ search: 'P17', select: /Tobakkmisbruk/ })(page)
        await addBidiagnose({ search: 'B80', select: /Jernmangelanemi/ })(page)

        await nextStep()(page)
        await expectSignerendeBehandler(mode)(page)

        const { request, draftId } = await submitSykmelding()(page)
        await expectGraphQLRequest(request).toBe(OpprettSykmeldingDocument, {
            draftId: draftId,
            meta: expectedSykmeldingMeta(mode),
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

    test(`${mode}: optional - multiple perioder back to back`, async ({ page }) => {
        await launchAndStart(mode)(page)

        await fillPeriodeRelative({ nth: 0, type: { grad: 60 }, fromRelative: 0, days: 6 })(page)
        await page.getByRole('button', { name: 'Legg til ny periode' }).click()
        await fillPeriodeRelative({ nth: 1, type: { grad: 80 }, fromRelative: 7, days: 6 })(page)
        await pickHoveddiagnose({ search: 'Angst', select: /Angstlidelse/ })(page)

        await nextStep()(page)
        await expectSignerendeBehandler(mode)(page)

        const { request, draftId } = await submitSykmelding()(page)
        await expectGraphQLRequest(request).toBe(OpprettSykmeldingDocument, {
            draftId: draftId,
            meta: expectedSykmeldingMeta(mode),
            force: false,
            values: {
                arbeidsforhold: null,
                hoveddiagnose: { code: 'P74', system: 'ICPC2' },
                bidiagnoser: [],
                aktivitet: [
                    {
                        type: 'GRADERT',
                        fom: today(),
                        tom: inDays(6),
                        gradert: { grad: 60, reisetilskudd: false },
                        aktivitetIkkeMulig: null,
                        avventende: null,
                        behandlingsdager: null,
                        reisetilskudd: null,
                    },
                    {
                        type: 'GRADERT',
                        fom: inDays(7),
                        tom: inDays(13),
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

    test(`${mode}: optional - 'tilbakedatering' is asked and required when fom is 5 days in the past`, async ({
        page,
    }) => {
        await launchAndStart(mode)(page)

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
        await expectSignerendeBehandler(mode)(page)

        await verifySummaryPage([
            mode === 'FHIR'
                ? {
                      name: 'Sykmeldingen gjelder',
                      values: ['Espen Eksempel', '21037712323'],
                  }
                : {
                      name: 'Sykmeldingen gjelder',
                      values: ['Ola Nordmann Hansen', '21037712323'],
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

        const { request, draftId } = await submitSykmelding()(page)

        await expectGraphQLRequest(request).toBe(OpprettSykmeldingDocument, {
            draftId: draftId,
            meta: expectedSykmeldingMeta(mode),
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

    test(`${mode}: optional - "tilbakedatering" and "Annen årsak" input field is required and part of payload when checked`, async ({
        page,
    }) => {
        await launchAndStart(mode)(page)

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
        await expectSignerendeBehandler(mode)(page)

        const { request, draftId } = await submitSykmelding()(page)

        await expectGraphQLRequest(request).toBe(OpprettSykmeldingDocument, {
            draftId: draftId,
            meta: expectedSykmeldingMeta(mode),
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

    test(`${mode}: optional - "har flere arbeidsforhold" should be part of payload if checked`, async ({ page }) => {
        await launchAndStart(mode)(page)

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

        await expectSignerendeBehandler(mode)(page)

        const { request, draftId } = await submitSykmelding()(page)
        await expectGraphQLRequest(request).toBe(OpprettSykmeldingDocument, {
            draftId: draftId,
            meta: expectedSykmeldingMeta(mode),
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

    test(`${mode}: optional - when 100%, "arbeidsrelaterte og medisinske årsaker" should be part of payload if checked`, async ({
        page,
    }) => {
        await launchAndStart(mode)(page)

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

        await expectSignerendeBehandler(mode)(page)

        const { request, draftId } = await submitSykmelding()(page)
        await expectGraphQLRequest(request).toBe(OpprettSykmeldingDocument, {
            draftId: draftId,
            meta: expectedSykmeldingMeta(mode),
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

    test(`${mode}: summary - "skal skjermes" should be part of payload if checked`, async ({ page }) => {
        await launchAndStart(mode)(page)

        await fillPeriodeRelative({
            type: '100%',
            days: 3,
        })(page)

        await pickHoveddiagnose({ search: 'Angst', select: /Angstlidelse/ })(page)

        await nextStep()(page)
        await expectSignerendeBehandler(mode)(page)

        await page.getByRole('checkbox', { name: 'Pasienten skal skjermes for medisinske opplysninger' }).check()
        const { request, draftId } = await submitSykmelding()(page)

        await expectGraphQLRequest(request).toBe(OpprettSykmeldingDocument, {
            draftId: draftId,
            meta: expectedSykmeldingMeta(mode),
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

    test.describe(`${mode}: rule outcomes`, () => {
        const launchAndFillBasic = userInteractionsGroup(
            launchAndStart(mode),
            pickHoveddiagnose({ search: 'Angst', select: /Angstlidelse/ }),
            fillPeriodeRelative({ type: '100%', days: 3 }),
            nextStep(),
            expectSignerendeBehandler(mode),
        )

        test(`${mode}: invalid but functionally expected: should be able to submit læll`, async ({ page }) => {
            await launchAndFillBasic(page)
            await submitSykmelding('invalid')(page)

            const confirmationModal = page.getByRole('dialog', { name: 'Vær oppmerksom' })
            await expect(confirmationModal).toBeVisible()

            const { request, draftId } = await confirmRuleOutcomeSubmit(confirmationModal)(page)
            await expectGraphQLRequest(request).toBe(OpprettSykmeldingDocument, {
                draftId: draftId,
                meta: expectedSykmeldingMeta(mode),
                force: true,
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

        test(`${mode}: manuell behandling and expected: should be able to submit læll`, async ({ page }) => {
            await launchAndFillBasic(page)
            await submitSykmelding('manual')(page)

            const confirmationModal = page.getByRole('dialog', { name: 'Vær oppmerksom' })
            await expect(confirmationModal).toBeVisible()

            const { request, draftId } = await confirmRuleOutcomeSubmit(confirmationModal)(page)
            await expectGraphQLRequest(request).toBe(OpprettSykmeldingDocument, {
                draftId: draftId,
                meta: expectedSykmeldingMeta(mode),
                force: true,
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

        test(`${mode}: invalid but unexpected: should NOT be able to submit`, async ({ page }) => {
            await launchAndFillBasic(page)
            await submitSykmelding('invalid-unexpected')(page)

            await expect(page.getByRole('heading', { name: 'Sykmelding kan ikke sendes inn' })).toBeVisible()
        })

        test(`${mode}: person does not exist in PDL: should NOT be able to submit`, async ({ page }) => {
            await launchAndFillBasic(page)
            await submitSykmelding('person-not-found')(page)

            await expect(
                page.getByRole('heading', { name: /Fant ikke (.*) \(21037712323\) i folkeregisteret/ }),
            ).toBeVisible()
        })
    })
})

const expectedSykmeldingMeta = (mode: Modes): OpprettSykmeldingMetaInput =>
    mode === 'FHIR'
        ? { orgnummer: null, legekontorTlf: null }
        : {
              orgnummer: '112233445',
              legekontorTlf: '+47 99887766',
          }

function launchAndStart(mode: Modes): (page: Page) => Promise<void> {
    return launchMode(
        mode,
        {
            onFhir: fhirActions.startNewSykmelding({ name: 'Espen Eksempel', fnr: '21037712323' }),
            onStandalone: userInteractionsGroup(
                standaloneActions.searchPerson('21037712323'),
                standaloneActions.startNewSykmelding('21037712323'),
            ),
        },
        'normal',
        { PILOT_USER: true },
    )
}

function expectSignerendeBehandler(mode: Modes): (page: Page) => Promise<void> {
    return onMode(mode, {
        fhir: async (page) => {
            await fhirUserVerification.verifySignerendeBehandler()(page)
        },
        stanalone: async (page) => {
            await standaloneUserVerification.verifySignerendeBehandler('123456')(page)
            await standaloneActions.fillOrgnummer('112233445')(page)
            await standaloneActions.fillTelefonnummer('+47 99887766')(page)
        },
    })
}
