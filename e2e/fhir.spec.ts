import { test, expect } from '@playwright/test'
import { addDays } from 'date-fns'

import { dateOnly } from '@utils/date'

import { launchWithMock } from './actions/fhir-actions'
import {
    initPreloadedPatient,
    editHoveddiagnose,
    fillAktivitetsPeriode,
    pickHoveddiagnose,
    pickSuggestedPeriod,
    submitSykmelding,
    nextStep,
} from './actions/user-actions'

test('can submit 100% sykmelding', async ({ page }) => {
    await launchWithMock(page)
    await initPreloadedPatient({ name: 'Espen Eksempel', fnr: '21037712323' })(page)

    await fillAktivitetsPeriode({
        type: '100%',
        fomRelativeToToday: 0,
        tomRelativeToToday: 3,
    })(page)

    await pickHoveddiagnose({ search: 'Angst', select: /Angstlidelse/ })(page)

    await nextStep()(page)

    const payload = await submitSykmelding()(page)
    expect(payload).toEqual({
        behandlerHpr: '9144889',
        values: {
            pasient: '21037712323',
            diagnoser: {
                hoved: { code: 'P74', system: 'ICPC2' },
            },
            aktivitet: {
                type: 'AKTIVITET_IKKE_MULIG',
                fom: dateOnly(new Date()),
                tom: dateOnly(addDays(new Date(), 3)),
                grad: null,
            },
        },
    })

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
        behandlerHpr: '9144889',
        values: {
            pasient: '21037712323',
            diagnoser: {
                hoved: { code: 'P74', system: 'ICPC2' },
            },
            aktivitet: {
                type: 'AKTIVITET_IKKE_MULIG',
                fom: dateOnly(new Date()),
                tom: dateOnly(addDays(new Date(), 3)),
                grad: null,
            },
        },
    })

    await expect(page.getByRole('heading', { name: 'Kvittering på innsendt sykmelding' })).toBeVisible()
})

test('shall be able to edit diagnose', async ({ page }) => {
    await launchWithMock(page)
    await initPreloadedPatient({ name: 'Espen Eksempel', fnr: '21037712323' })(page)

    await fillAktivitetsPeriode({
        type: '100%',
        fomRelativeToToday: 0,
        tomRelativeToToday: 3,
    })(page)

    const diagnoseRegion = await pickHoveddiagnose({ search: 'Angst', select: /Angstlidelse/ })(page)
    await editHoveddiagnose({ search: 'D290', select: /D290/ })(diagnoseRegion)

    await nextStep()(page)

    const payload = await submitSykmelding()(page)
    expect(payload).toEqual({
        behandlerHpr: '9144889',
        values: {
            pasient: '21037712323',
            diagnoser: { hoved: { code: 'D290', system: 'ICD10' } },
            aktivitet: {
                type: 'AKTIVITET_IKKE_MULIG',
                fom: dateOnly(new Date()),
                tom: dateOnly(addDays(new Date(), 3)),
                grad: null,
            },
        },
    })

    await expect(page.getByRole('heading', { name: 'Kvittering på innsendt sykmelding' })).toBeVisible()
})

test('can submit gradert sykmelding', async ({ page }) => {
    await launchWithMock(page)
    await initPreloadedPatient({ name: 'Espen Eksempel', fnr: '21037712323' })(page)

    await fillAktivitetsPeriode({
        type: { grad: 50 },
        fomRelativeToToday: 0,
        tomRelativeToToday: 3,
    })(page)

    await pickHoveddiagnose({ search: 'Angst', select: /Angstlidelse/ })(page)

    await nextStep()(page)

    const payload = await submitSykmelding()(page)
    expect(payload).toEqual({
        behandlerHpr: '9144889',
        values: {
            pasient: '21037712323',
            diagnoser: {
                hoved: { system: 'ICPC2', code: 'P74' },
            },
            aktivitet: {
                type: 'GRADERT',
                fom: dateOnly(new Date()),
                tom: dateOnly(addDays(new Date(), 3)),
                grad: '50',
            },
        },
    })

    await expect(page.getByRole('heading', { name: 'Kvittering på innsendt sykmelding' })).toBeVisible()
})
