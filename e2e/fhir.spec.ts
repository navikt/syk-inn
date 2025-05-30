import { test, expect } from '@playwright/test'

import { OpprettSykmeldingMutationVariables } from '@queries'

import { launchWithMock } from './actions/fhir-actions'
import { daysAgo, inDays, today } from './utils/date-utils'
import {
    initPreloadedPatient,
    editHoveddiagnose,
    fillPeriodeRelative,
    pickHoveddiagnose,
    pickSuggestedPeriod,
    submitSykmelding,
    nextStep,
    fillTilbakedatering,
    verifySummaryPage,
} from './actions/user-actions'

test('can submit 100% sykmelding', async ({ page }) => {
    await launchWithMock(page)
    await initPreloadedPatient({ name: 'Espen Eksempel', fnr: '21037712323' })(page)

    await fillPeriodeRelative({
        type: '100%',
        days: 3,
    })(page)

    await pickHoveddiagnose({ search: 'Angst', select: /Angstlidelse/ })(page)

    await nextStep()(page)

    const payload = await submitSykmelding()(page)
    expect(payload).toEqual({
        values: {
            pasientIdent: '21037712323',
            hoveddiagnose: { code: 'P74', system: 'ICPC2' },
            perioder: [
                {
                    type: 'AKTIVITET_IKKE_MULIG',
                    fom: today(),
                    tom: inDays(3),
                    grad: null,
                },
            ],
        },
    } satisfies OpprettSykmeldingMutationVariables)

    await expect(page.getByRole('heading', { name: 'Kvittering på innsendt sykmelding' })).toBeVisible()
})

test('can submit 100% sykmelding and use week picker', async ({ page }) => {
    await launchWithMock(page)
    await initPreloadedPatient({ name: 'Espen Eksempel', fnr: '21037712323' })(page)

    await pickSuggestedPeriod('3 dager')(page)

    await pickHoveddiagnose({ search: 'Angst', select: /Angstlidelse/ })(page)

    await nextStep()(page)

    const payload = await submitSykmelding()(page)
    expect(payload).toEqual({
        values: {
            pasientIdent: '21037712323',
            hoveddiagnose: { code: 'P74', system: 'ICPC2' },
            perioder: [
                {
                    type: 'AKTIVITET_IKKE_MULIG',
                    fom: today(),
                    tom: inDays(3),
                    grad: null,
                },
            ],
        },
    } satisfies OpprettSykmeldingMutationVariables)

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

    const payload = await submitSykmelding()(page)
    expect(payload).toEqual({
        values: {
            pasientIdent: '21037712323',
            hoveddiagnose: { code: 'D290', system: 'ICD10' },
            perioder: [
                {
                    type: 'AKTIVITET_IKKE_MULIG',
                    fom: today(),
                    tom: inDays(3),
                    grad: null,
                },
            ],
        },
    } satisfies OpprettSykmeldingMutationVariables)

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

    const payload = await submitSykmelding()(page)
    expect(payload).toEqual({
        values: {
            pasientIdent: '21037712323',
            hoveddiagnose: { system: 'ICPC2', code: 'P74' },
            perioder: [
                {
                    type: 'GRADERT',
                    fom: today(),
                    tom: inDays(3),
                    grad: '50',
                },
            ],
        },
    } satisfies OpprettSykmeldingMutationVariables)

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

    const payload = await submitSykmelding()(page)
    expect(payload).toEqual({
        values: {
            pasientIdent: '21037712323',
            hoveddiagnose: { system: 'ICPC2', code: 'P74' },
            perioder: [
                {
                    type: 'AKTIVITET_IKKE_MULIG',
                    fom: daysAgo(9),
                    tom: inDays(1),
                    grad: null,
                },
            ],
        },
    } satisfies OpprettSykmeldingMutationVariables)
})
