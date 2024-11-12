import { test, expect } from '@playwright/test'

test('has title', async ({ page }) => {
    await page.goto(`/fhir/launch?iss=http://localhost:3000/api/mocks/fhir`)

    await expect(page.getByRole('heading', { name: 'Opprett ny sykmelding' })).toBeVisible()

    const pasientInfoRegion = page.getByRole('region', { name: 'Info om pasienten' })
    await expect(pasientInfoRegion).toBeVisible()
    await expect(pasientInfoRegion.getByText('Espen Eksempel')).toBeVisible()
    await expect(pasientInfoRegion.getByText('21037712323 (fødselsnummer)')).toBeVisible()

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
