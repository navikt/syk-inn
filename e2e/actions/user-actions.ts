import { expect, Locator, Page } from '@playwright/test'
import { add, format } from 'date-fns'

import { clickAndWait, waitForHttp } from '../utils/request-utils'

export function initPreloadedPatient({ name, fnr }: { name: string; fnr: string }) {
    return async (page: Page) => {
        const pasientInfoRegion = page.getByRole('region', { name: 'Opprett ny sykmelding' })
        await expect(pasientInfoRegion).toBeVisible()
        await expect(pasientInfoRegion.getByText(name)).toBeVisible()
        await expect(page.getByText(new RegExp(`ID-nummer(.*)${fnr}`))).toBeVisible()

        await pasientInfoRegion.getByRole('button', { name: 'Opprett sykmelding' }).click()
    }
}

export function fillManualPasient({ fnr }: { fnr: string }) {
    return async (page: Page) => {
        const pasientInfoRegion = page.getByRole('region', { name: 'Pasientopplysningen' })
        await expect(pasientInfoRegion).toBeVisible()
        await pasientInfoRegion.getByRole('textbox', { name: 'Fødselsnummer' }).fill(fnr)
    }
}

export function pickHoveddiagnose({ search, select }: { search: string; select: RegExp }) {
    return async (page: Page) => {
        const diagnoseRegion = page.getByRole('region', { name: 'Diagnose' })
        await expect(diagnoseRegion).toBeVisible()

        await page.getByRole('button', { name: 'Endre hoveddiagnose' }).click() // Diagnose is pre-filled
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
    fomRelativeToToday,
    tomRelativeToToday,
}: {
    type: '100%' | { grad: number }
    fomRelativeToToday: number
    tomRelativeToToday: number
}) {
    const fom = add(new Date(), { days: fomRelativeToToday })

    const tom = add(new Date(), { days: tomRelativeToToday })

    return async (page: Page) => {
        const periodeRegion = page.getByRole('region', { name: 'Sykmeldingsperiode' })
        await expect(periodeRegion).toBeVisible()
        await periodeRegion.getByRole('textbox', { name: 'Fra og med' }).fill(format(fom, 'dd.MM.yyyy'))
        await periodeRegion.getByRole('textbox', { name: 'Til og med' }).fill(format(tom, 'dd.MM.yyyy'))

        if (typeof type !== 'string' && 'grad' in type) {
            await page
                .getByRole('group', { name: 'Aktivitetsbegrensning' })
                .getByRole('radio', { name: /Noe mulighet for aktivitet/ })
                .click()

            await page.getByRole('spinbutton', { name: 'Sykmeldingsgrad' }).fill(`${type.grad}`)
        }
    }
}

export function pickSuggestedPeriod(weeks: '3 dager' | 'tom søndag' | '1 uke') {
    return async (page: Page) => {
        const aktivitetRegion = page.getByRole('region', { name: 'Periode' })
        await expect(aktivitetRegion).toBeVisible()

        let label
        switch (weeks) {
            case '3 dager':
                label = '3 dager'
                break
            case 'tom søndag':
                label = 'Til og med søndag'
                break
            case '1 uke':
                label = '1 uke'
                break
            default:
                throw new Error(`Unknown period: ${weeks}`)
        }
        await aktivitetRegion.getByRole('button', { name: label }).click()
    }
}

export function submitSykmelding() {
    return async (page: Page): Promise<unknown> => {
        const request = await clickAndWait(
            page.getByRole('button', { name: 'Send inn' }).click(),
            waitForHttp('/fhir/resources/sykmelding/submit', 'POST')(page),
        )

        return request.postDataJSON()
    }
}

export function nextStep() {
    return async (page: Page) => {
        const nextButton = page.getByRole('button', { name: 'Neste steg' })
        await expect(nextButton).toBeVisible()
        await nextButton.click()
    }
}
