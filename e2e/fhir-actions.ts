import { expect, Page } from '@playwright/test'

export async function launchWithMock(page: Page): Promise<void> {
    await page.goto(`/fhir/launch?iss=http://localhost:3000/api/mocks/fhir`)

    await expect(page.getByRole('heading', { name: 'Opprett ny sykmelding' })).toBeVisible()
}

export function assertPreloadedPatient({ name, fnr }: { name: string; fnr: string }) {
    return async (page: Page) => {
        const pasientInfoRegion = page.getByRole('region', { name: 'Info om pasienten' })
        await expect(pasientInfoRegion).toBeVisible()
        await expect(pasientInfoRegion.getByText(name)).toBeVisible()
        await expect(pasientInfoRegion.getByText(`${fnr} (fødselsnummer)`)).toBeVisible()
    }
}
