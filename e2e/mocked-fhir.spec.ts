import { test, expect } from '@playwright/test'

import { assertPreloadedPatient, fillAktivitetsPeriode, launchWithMock, pickHoveddiagnose } from './fhir-actions'

test('can submit 100% sykmelding', async ({ page }) => {
    await launchWithMock(page)
    await assertPreloadedPatient({ name: 'Espen Eksempel', fnr: '21037712323' })(page)
    await pickHoveddiagnose({ search: 'Angst', select: /Angstlidelse/ })(page)
    await fillAktivitetsPeriode({
        type: '100%',
        fom: '15.02.2024',
        tom: '18.02.2024',
    })(page)

    await page.getByRole('button', { name: 'Opprett sykmelding' }).click()

    await expect(page.getByRole('heading', { name: 'Takk for i dag' })).toBeVisible()
})

test('shall be able to edit diagnose', async ({ page }) => {
    await launchWithMock(page)
    await assertPreloadedPatient({ name: 'Espen Eksempel', fnr: '21037712323' })(page)
    const diagnoseRegion = await pickHoveddiagnose({ search: 'Angst', select: /Angstlidelse/ })(page)

    await diagnoseRegion.getByRole('button', { name: 'Endre hoveddiagnose' }).click()
    await diagnoseRegion.getByRole('combobox', { name: 'Hoveddiagnose' }).fill('D290')
    await diagnoseRegion.getByRole('option', { name: /D290/ }).click()

    await fillAktivitetsPeriode({
        type: '100%',
        fom: '15.02.2024',
        tom: '18.02.2024',
    })(page)

    await page.getByRole('button', { name: 'Opprett sykmelding' }).click()

    await expect(page.getByRole('heading', { name: 'Takk for i dag' })).toBeVisible()
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

    await page.getByRole('button', { name: 'Opprett sykmelding' }).click()

    await expect(page.getByRole('heading', { name: 'Takk for i dag' })).toBeVisible()
})
