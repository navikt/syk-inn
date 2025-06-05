import { test, expect } from '@playwright/test'

import { OpprettSykmeldingDocument } from '@queries'

import { launchWithMock } from './actions/fhir-actions'
import { daysAgo, inDays, today } from './utils/date-utils'
import {
    initPreloadedPatient,
    editHoveddiagnose,
    fillPeriodeRelative,
    pickHoveddiagnose,
    submitSykmelding,
    nextStep,
    fillTilbakedatering,
    verifySummaryPage,
} from './actions/user-actions'
import { expectGraphQLRequest } from './utils/assertions'

test('can submit 100% sykmelding', async ({ page }) => {
    await launchWithMock(page)
    await initPreloadedPatient({ name: 'Espen Eksempel', fnr: '21037712323' })(page)

    await fillPeriodeRelative({
        type: '100%',
        days: 3,
    })(page)

    await pickHoveddiagnose({ search: 'Angst', select: /Angstlidelse/ })(page)

    await nextStep()(page)

    const request = await submitSykmelding()(page)
    expectGraphQLRequest(request).toBe(OpprettSykmeldingDocument, {
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
                },
            ],
            meldinger: { tilNav: null, tilArbeidsgiver: null },
            svangerskapsrelatert: false,
            yrkesskade: { yrkesskade: false, skadedato: null },
            arbeidsgiver: null,
            tilbakedatering: null,
            pasientenSkalSkjermes: false,
        },
    })

    await expect(page.getByRole('heading', { name: 'Kvittering på innsendt sykmelding' })).toBeVisible()
})

test('shall be able to edit diagnose', async ({ page }) => {
    await launchWithMock(page)
    await initPreloadedPatient({ name: 'Espen Eksempel', fnr: '21037712323' })(page)

    await fillPeriodeRelative({
        type: '100%',
        days: 3,
    })(page)

    const diagnoseRegion = await pickHoveddiagnose({ search: 'Angst', select: /Angstlidelse/ })(page)
    await editHoveddiagnose({ search: 'D290', select: /D290/ })(diagnoseRegion)

    await nextStep()(page)

    const request = await submitSykmelding()(page)
    expectGraphQLRequest(request).toBe(OpprettSykmeldingDocument, {
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
                },
            ],
            meldinger: { tilNav: null, tilArbeidsgiver: null },
            svangerskapsrelatert: false,
            yrkesskade: { yrkesskade: false, skadedato: null },
            arbeidsgiver: null,
            tilbakedatering: null,
            pasientenSkalSkjermes: false,
        },
    })

    await expect(page.getByRole('heading', { name: 'Kvittering på innsendt sykmelding' })).toBeVisible()
})

test('can submit gradert sykmelding', async ({ page }) => {
    await launchWithMock(page)
    await initPreloadedPatient({ name: 'Espen Eksempel', fnr: '21037712323' })(page)

    await fillPeriodeRelative({
        type: { grad: 50 },
        days: 3,
    })(page)

    await pickHoveddiagnose({ search: 'Angst', select: /Angstlidelse/ })(page)

    await nextStep()(page)

    const request = await submitSykmelding()(page)
    expectGraphQLRequest(request).toBe(OpprettSykmeldingDocument, {
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
            arbeidsgiver: null,
            tilbakedatering: null,
            pasientenSkalSkjermes: false,
        },
    })

    await expect(page.getByRole('heading', { name: 'Kvittering på innsendt sykmelding' })).toBeVisible()
})

test("should be asked about 'tilbakedatering' when fom is 9 days in the past", async ({ page }) => {
    await launchWithMock(page)
    await initPreloadedPatient({ name: 'Espen Eksempel', fnr: '21037712323' })(page)

    await fillPeriodeRelative({
        type: '100%',
        fromRelative: -9,
        days: 10,
    })(page)
    await fillTilbakedatering({
        contact: daysAgo(2),
        reason: 'Ferie eller noe',
    })(page)
    await pickHoveddiagnose({ search: 'Angst', select: /Angstlidelse/ })(page)

    await nextStep()(page)

    await verifySummaryPage({
        tilbakedatering: {
            contact: daysAgo(2),
            reason: 'Ferie eller noe',
        },
    })(page)

    const request = await submitSykmelding()(page)

    expectGraphQLRequest(request).toBe(OpprettSykmeldingDocument, {
        values: {
            hoveddiagnose: { system: 'ICPC2', code: 'P74' },
            bidiagnoser: [],
            aktivitet: [
                {
                    type: 'AKTIVITET_IKKE_MULIG',
                    fom: daysAgo(9),
                    tom: inDays(1),
                    aktivitetIkkeMulig: { dummy: true },
                    avventende: null,
                    gradert: null,
                    behandlingsdager: null,
                    reisetilskudd: null,
                },
            ],
            tilbakedatering: {
                startdato: daysAgo(2),
                begrunnelse: 'Ferie eller noe',
            },
            meldinger: { tilNav: null, tilArbeidsgiver: null },
            svangerskapsrelatert: false,
            yrkesskade: { yrkesskade: false, skadedato: null },
            arbeidsgiver: null,
            pasientenSkalSkjermes: false,
        },
    })
})
