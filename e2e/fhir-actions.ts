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

export function pickHoveddiagnose({ search, select }: { search: string; select: RegExp }) {
    return async (page: Page) => {
        const diagnoseRegion = page.getByRole('region', { name: 'Diagnose' })
        await expect(diagnoseRegion).toBeVisible()
        await diagnoseRegion.getByRole('combobox', { name: 'Hoveddiagnose' }).fill(search)
        await diagnoseRegion.getByRole('option', { name: select }).click()

        return diagnoseRegion
    }
}

export function fillAktivitetsPeriode({
    type,
    fom,
    tom,
}: {
    type: '100%' | { grad: number }
    fom: string
    tom: string
}) {
    return async (page: Page) => {
        const aktivitetRegion = page.getByRole('region', { name: 'Aktivitet' })
        await expect(aktivitetRegion).toBeVisible()
        await aktivitetRegion.getByRole('textbox', { name: 'Fra og med' }).fill(fom)
        await aktivitetRegion.getByRole('textbox', { name: 'Til og med' }).fill(tom)

        if (typeof type !== 'string' && 'grad' in type) {
            await aktivitetRegion
                .getByRole('group', { name: 'Aktivitetsbegrensning' })
                .getByRole('radio', { name: 'Noe mulighet for aktivitet' })
                .click()

            await aktivitetRegion.getByRole('textbox', { name: 'Grad' }).fill(`${type.grad}`)
        }

        return aktivitetRegion
    }
}
