import { test, expect } from '@playwright/test'

import { assertPreloadedPatient, launchWithMock } from './fhir-actions'

test('can submit 100% sykmelding', async ({ page }) => {
    await launchWithMock(page)
    await assertPreloadedPatient({ name: 'Espen Eksempel', fnr: '21037712323' })(page)

    const diagnoseRegion = page.getByRole('region', { name: 'Diagnose' })
    await expect(diagnoseRegion).toBeVisible()
    await diagnoseRegion.getByRole('combobox', { name: 'Hoveddiagnose' }).fill('Angst')
    await diagnoseRegion.getByRole('option', { name: /Angstlidelse/ }).click()

    await diagnoseRegion.getByRole('button', { name: 'Endre hoveddiagnose' }).click()
    await diagnoseRegion.getByRole('combobox', { name: 'Hoveddiagnose' }).fill('D290')
    await diagnoseRegion.getByRole('option', { name: /D290/ }).click()

    const aktivitetRegion = page.getByRole('region', { name: 'Aktivitet' })
    await expect(aktivitetRegion).toBeVisible()
    await aktivitetRegion.getByRole('textbox', { name: 'Fra og med' }).fill('15.02.2024')
    await aktivitetRegion.getByRole('textbox', { name: 'Til og med' }).fill('18.02.2024')

    await page.getByRole('button', { name: 'Opprett sykmelding' }).click()

    await expect(page.getByRole('heading', { name: 'Takk for i dag' })).toBeVisible()
})

test('shall be able to edit diagnose', async ({ page }) => {
    await launchWithMock(page)
    await assertPreloadedPatient({ name: 'Espen Eksempel', fnr: '21037712323' })(page)

    const diagnoseRegion = page.getByRole('region', { name: 'Diagnose' })
    await expect(diagnoseRegion).toBeVisible()
    await diagnoseRegion.getByRole('combobox', { name: 'Hoveddiagnose' }).fill('Angst')
    await diagnoseRegion.getByRole('option', { name: /Angstlidelse/ }).click()

    const aktivitetRegion = page.getByRole('region', { name: 'Aktivitet' })
    await expect(aktivitetRegion).toBeVisible()
    await aktivitetRegion.getByRole('textbox', { name: 'Fra og med' }).fill('15.02.2024')
    await aktivitetRegion.getByRole('textbox', { name: 'Til og med' }).fill('18.02.2024')

    await page.getByRole('button', { name: 'Opprett sykmelding' }).click()

    await expect(page.getByRole('heading', { name: 'Takk for i dag' })).toBeVisible()
})

test('can submit gradert sykmelding', async ({ page }) => {
    await launchWithMock(page)
    await assertPreloadedPatient({ name: 'Espen Eksempel', fnr: '21037712323' })(page)

    const diagnoseRegion = page.getByRole('region', { name: 'Diagnose' })
    await expect(diagnoseRegion).toBeVisible()
    await diagnoseRegion.getByRole('combobox', { name: 'Hoveddiagnose' }).fill('Angst')
    await diagnoseRegion.getByRole('option', { name: /Angstlidelse/ }).click()

    const aktivitetRegion = page.getByRole('region', { name: 'Aktivitet' })
    await expect(aktivitetRegion).toBeVisible()
    await aktivitetRegion.getByRole('textbox', { name: 'Fra og med' }).fill('15.02.2024')
    await aktivitetRegion.getByRole('textbox', { name: 'Til og med' }).fill('18.02.2024')

    await aktivitetRegion
        .getByRole('group', { name: 'Aktivitetsbegrensning' })
        .getByRole('radio', { name: 'Noe mulighet for aktivitet' })
        .click()

    await aktivitetRegion.getByRole('textbox', { name: 'Grad' }).fill('50')

    await page.getByRole('button', { name: 'Opprett sykmelding' }).click()

    await expect(page.getByRole('heading', { name: 'Takk for i dag' })).toBeVisible()
})
