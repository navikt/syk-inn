import { test, expect } from '@playwright/test'

import { launchWithMock } from './actions/fhir-actions'
import {
    assertPreloadedPatient,
    editHoveddiagnose,
    fillAktivitetsPeriode,
    pickHoveddiagnose,
    submitSykmelding,
} from './actions/user-actions'

test('can submit 100% sykmelding', async ({ page }) => {
    await launchWithMock(page)
    await assertPreloadedPatient({ name: 'Espen Eksempel', fnr: '21037712323' })(page)
    await pickHoveddiagnose({ search: 'Angst', select: /Angstlidelse/ })(page)
    await fillAktivitetsPeriode({
        type: '100%',
        fom: '15.02.2024',
        tom: '18.02.2024',
    })(page)

    const payload = await submitSykmelding()(page)
    expect(payload).toEqual({
        behandlerHpr: '9144889',
        values: {
            pasient: '21037712323',
            diagnoser: {
                hoved: { code: 'P74', system: 'ICPC2', text: 'Angstlidelse' },
            },
            aktivitet: {
                type: 'AKTIVITET_IKKE_MULIG',
                fom: '2024-02-15',
                tom: '2024-02-18',
                grad: null,
            },
        },
    })
})

test('shall be able to edit diagnose', async ({ page }) => {
    await launchWithMock(page)
    await assertPreloadedPatient({ name: 'Espen Eksempel', fnr: '21037712323' })(page)

    const diagnoseRegion = await pickHoveddiagnose({ search: 'Angst', select: /Angstlidelse/ })(page)
    await editHoveddiagnose({ search: 'D290', select: /D290/ })(diagnoseRegion)

    await fillAktivitetsPeriode({
        type: '100%',
        fom: '15.02.2024',
        tom: '18.02.2024',
    })(page)

    const payload = await submitSykmelding()(page)
    expect(payload).toEqual({
        behandlerHpr: '9144889',
        values: {
            pasient: '21037712323',
            diagnoser: { hoved: { code: 'D290', system: 'ICD10', text: 'Godartet svulst i penis' } },
            aktivitet: {
                type: 'AKTIVITET_IKKE_MULIG',
                fom: '2024-02-15',
                tom: '2024-02-18',
                grad: null,
            },
        },
    })
})

test('can submit gradert sykmelding', async ({ page }) => {
    await launchWithMock(page)
    await assertPreloadedPatient({ name: 'Espen Eksempel', fnr: '21037712323' })(page)
    await pickHoveddiagnose({ search: 'Angst', select: /Angstlidelse/ })(page)
    await fillAktivitetsPeriode({
        type: { grad: 50 },
        fom: '15.02.2024',
        tom: '18.02.2024',
    })(page)

    const payload = await submitSykmelding()(page)
    expect(payload).toEqual({
        behandlerHpr: '9144889',
        values: {
            pasient: '21037712323',
            diagnoser: {
                hoved: { system: 'ICPC2', code: 'P74', text: 'Angstlidelse' },
            },
            aktivitet: {
                type: 'GRADERT',
                fom: '2024-02-15',
                tom: '2024-02-18',
                grad: '50',
            },
        },
    })
})
