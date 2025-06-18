import { expect, Locator, Page } from '@playwright/test'
import { add } from 'date-fns'
import { GraphQLRequest } from '@apollo/client'

import { clickAndWait, waitForGraphQL } from '../utils/request-utils'
import { inputDate } from '../utils/date-utils'
import { expectTermToHaveDefinitions } from '../utils/assertions'

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
        const diagnoseRegion = page.getByRole('region', { name: 'Diagnose', exact: true })
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

export function fillPeriodeRelative({
    type,
    ...params
}: { type: '100%' | { grad: number } } & ({ days: number } | { fromRelative: number; days: number })) {
    const [fomRelativeToToday, tomRelativeToToday] =
        'fromRelative' in params ? [params.fromRelative, params.fromRelative + params.days] : [0, params.days]

    const fom = add(new Date(), { days: fomRelativeToToday })
    const tom = add(new Date(), { days: tomRelativeToToday })

    return async (page: Page) => {
        const periodeRegion = page.getByRole('region', { name: 'Periode' })
        await expect(periodeRegion).toBeVisible()
        await periodeRegion.getByRole('textbox', { name: 'Fra og med' }).fill(inputDate(fom))
        await periodeRegion.getByRole('textbox', { name: 'Til og med' }).fill(inputDate(tom))

        if (typeof type === 'string' && type === '100%') {
            await page.getByRole('combobox', { name: 'Mulighet for arbeid' }).selectOption('Aktivitet ikke mulig')
        }

        if (typeof type !== 'string' && 'grad' in type) {
            await page.getByRole('combobox', { name: 'Mulighet for arbeid' }).selectOption('Gradert sykmelding')

            await page.getByRole('textbox', { name: 'Sykmeldingsgrad (%)' }).fill(`${type.grad}`)
        }
    }
}

export function fillTilbakedatering({ contact, reason }: { contact: string; reason: string }) {
    return async (page: Page) => {
        const region = page.getByRole('region', { name: 'Tilbakedatering' })
        await expect(region).toBeVisible()

        await region.getByRole('textbox', { name: 'Når tok pasienten først kontakt' }).fill(inputDate(contact))
        await region.getByRole('textbox', { name: 'Oppgi årsak for tilbakedatering' }).fill(reason)
    }
}

export function fillAndreSporsmal({
    svangerskapsrelatert,
    yrkesskade,
}: {
    svangerskapsrelatert: boolean
    yrkesskade: boolean
}) {
    return async (page: Page) => {
        const region = page.getByRole('region', { name: 'Andre spørsmål' })
        await expect(region).toBeVisible()

        if (svangerskapsrelatert) {
            await region.getByRole('checkbox', { name: 'Svangerskapsrelatert' }).check()
        } else {
            await region.getByRole('checkbox', { name: 'Svangerskapsrelatert' }).uncheck()
        }

        if (yrkesskade) {
            await region.getByRole('checkbox', { name: 'Yrkesskade' }).check()
        } else {
            await region.getByRole('checkbox', { name: 'Yrkesskade' }).uncheck()
        }
    }
}

export function fillMeldinger({ tilNav, tilArbeidsgiver }: { tilNav: string | null; tilArbeidsgiver: string | null }) {
    return async (page: Page) => {
        const region = page.getByRole('region', { name: 'Meldinger' })
        await expect(region).toBeVisible()

        if (await region.getByRole('button', { name: 'Vis mer' }).isVisible()) {
            await region.getByRole('button', { name: 'Vis mer' }).click()
        }

        if (tilNav) {
            await region.getByRole('checkbox', { name: 'Melding til Nav' }).check()
            await region.getByRole('textbox', { name: 'Har du noen tilbakemeldinger?' }).fill(tilNav)
        }

        if (tilArbeidsgiver) {
            await region.getByRole('checkbox', { name: 'Melding til arbeidsgiver' }).check()
            await region.getByRole('textbox', { name: 'Innspill til arbeidsgiver' }).fill(tilArbeidsgiver)
        }
    }
}

type SectionTitle =
    | 'Navn'
    | 'Fødselsnummer'
    | 'Periode'
    | 'Mulighet for arbeid'
    | 'Dato for tilbakedatering'
    | 'Grunn for tilbakedatering'
    | 'Hoveddiagnose'
    | 'Til NAV'
    | 'Til arbeidsgiver'
    | 'Svangerskapsrelatert'
    | 'Yrkesskade'
interface SummarySection {
    name: SectionTitle
    values: string[]
}

export function verifySummaryPage(sections: SummarySection[]) {
    return async (page: Page) => {
        await expect(page.getByRole('heading', { name: 'Oppsummering sykmelding' })).toBeVisible()
        await expect(page.getByRole('button', { name: 'Endre svar' })).toBeVisible()

        await Promise.all(
            sections.map(async (section) => {
                await expectTermToHaveDefinitions(page, section.name, section.values)
            }),
        )
    }
}

export function submitSykmelding() {
    return async (page: Page): Promise<GraphQLRequest> => {
        const request = await clickAndWait(page.getByRole('button', { name: 'Send inn' }).click(), waitForGraphQL(page))
        return request.postDataJSON()
    }
}

export function verifySignerendeBehandler() {
    return async (page: Page) => {
        await expect(page.getByText(/HPR(.*)9144889/), 'Correct HPR').toBeVisible()
        await expect(page.getByText(/Organisasjonsnummer(.*)123456789/), 'Correct Org').toBeVisible()
    }
}

export function nextStep() {
    return async (page: Page) => {
        const nextButton = page.getByRole('button', { name: 'Neste steg' })
        await expect(nextButton).toBeVisible()
        await nextButton.click()
    }
}

export function saveDraft() {
    return async (page: Page) => {
        const nextButton = page.getByRole('button', { name: 'Lagre (utkast)' })
        await expect(nextButton).toBeVisible()
        await nextButton.click()
    }
}

export function previousStep() {
    return async (page: Page) => {
        const previousButton = page.getByRole('button', { name: 'Forrige steg' })
        await expect(previousButton).toBeVisible()
        await previousButton.click()
    }
}
