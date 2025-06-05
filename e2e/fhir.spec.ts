import { test, expect } from '@playwright/test'

import { OpprettSykmeldingDocument } from '@queries'
import { toReadableDate, toReadableDatePeriod } from '@utils/date'

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
import { getDraftId } from './utils/request-utils'

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
            draftId: getDraftId(page) ?? 'missing',
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
            draftId: getDraftId(page) ?? 'missing',
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
            draftId: getDraftId(page) ?? 'missing',
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

    await verifySummaryPage([
        {
            name: 'Navn',
            values: ['Espen Eksempel'],
        },
        { name: 'Fødselsnummer', values: ['21037712323'] },
        {
            name: 'Periode',
            values: [`${toReadableDatePeriod(daysAgo(9), inDays(1))}`],
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
    expectGraphQLRequest(request).toBe(OpprettSykmeldingDocument, {
        values: {
            draftId: getDraftId(page) ?? 'missing',
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
    })
})
