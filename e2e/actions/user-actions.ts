import { expect, Locator, Page } from '@playwright/test'

export function assertPreloadedPatient({ name, fnr }: { name: string; fnr: string }) {
    return async (page: Page) => {
        const pasientInfoRegion = page.getByRole('region', { name: 'Info om pasienten' })
        await expect(pasientInfoRegion).toBeVisible()
        await expect(pasientInfoRegion.getByText(name)).toBeVisible()
        await expect(pasientInfoRegion.getByText(`${fnr} (fødselsnummer)`)).toBeVisible()
    }
}

export function fillManualPasient({ fnr }: { fnr: string }) {
    return async (page: Page) => {
        const pasientInfoRegion = page.getByRole('region', { name: 'Info om pasienten' })
        await expect(pasientInfoRegion).toBeVisible()
        await pasientInfoRegion.getByRole('textbox', { name: 'Fødselsnummer' }).fill(fnr)
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

export function editHoveddiagnose({ search, select }: { search: string; select: RegExp }) {
    return async (region: Locator) => {
        await region.getByRole('button', { name: 'Endre hoveddiagnose' }).click()
        await region.getByRole('combobox', { name: 'Hoveddiagnose' }).fill(search)
        await region.getByRole('option', { name: select }).click()
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
