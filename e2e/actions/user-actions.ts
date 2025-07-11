import { expect, Locator, Page, test } from '@playwright/test'
import { add } from 'date-fns'
import { GraphQLRequest } from '@apollo/client'

import { OpprettSykmeldingDocument } from '@queries'
import { toReadableDatePeriod } from '@utils/date'

import { clickAndWait, waitForGqlRequest } from '../utils/request-utils'
import { inputDate } from '../utils/date-utils'

export function startNewSykmelding(patient?: { name: string; fnr: string }) {
    return async (page: Page) => {
        await test.step(
            patient == null ? 'Start new sykmelding' : 'Verify the patient and start new sykmelding',
            async () => {
                const pasientInfoRegion = page.getByRole('region', { name: 'Opprett ny sykmelding' })

                if (patient != null) {
                    await expect(pasientInfoRegion).toBeVisible()
                    await expect(pasientInfoRegion.getByText(patient.name)).toBeVisible()
                    await expect(page.getByText(new RegExp(`ID-nummer(.*)${patient.fnr}`))).toBeVisible()
                }

                await pasientInfoRegion.getByRole('button', { name: 'Opprett sykmelding' }).click()
            },
        )
    }
}

export function pickHoveddiagnose({ search, select }: { search: string; select: RegExp }) {
    return async (page: Page) => {
        return await test.step('Input hoveddiagnose', async () => {
            const diagnoseRegion = page.getByRole('region', { name: 'Diagnose', exact: true })
            await expect(diagnoseRegion).toBeVisible()

            await page.getByRole('button', { name: 'Endre' }).click() // Diagnose is pre-filled
            await diagnoseRegion.getByRole('combobox', { name: 'Hoveddiagnose' }).fill(search)
            await diagnoseRegion.getByRole('option', { name: select }).click()

            return diagnoseRegion
        })
    }
}

export function editHoveddiagnose({ search, select }: { search: string; select: RegExp }) {
    return async (region: Locator) => {
        await test.step(`Edit hoveddiagnose to ${search}`, async () => {
            await region.getByRole('button', { name: 'Endre' }).click()
            await region.getByRole('combobox', { name: 'Hoveddiagnose' }).fill(search)
            await region.getByRole('option', { name: select }).click()
        })
    }
}

export function addBidiagnose({ search, select }: { search: string; select: RegExp }) {
    return async (page: Page) => {
        return await test.step('Add new bidiagnose', async () => {
            const bidiagnoseRegion = page.getByRole('region', { name: 'Bidiagnoser', exact: true })
            await expect(bidiagnoseRegion).toBeVisible()

            const currentBiDiagnoseCount = await bidiagnoseRegion
                .getByRole('group', { name: /Bidiagnose \d+/, exact: true })
                .count()
            const nextBiDiagnoseIndex = currentBiDiagnoseCount + 1

            await bidiagnoseRegion.getByRole('button', { name: 'Legg til bidiagnose' }).click() // Diagnose is pre-filled

            const relevantDiagnoseSection = bidiagnoseRegion.getByRole('group', {
                name: `Bidiagnose ${nextBiDiagnoseIndex}`,
            })
            await relevantDiagnoseSection.getByRole('combobox', { name: 'Bidiagnose' }).fill(search)
            await relevantDiagnoseSection.getByRole('option', { name: select }).click()

            return bidiagnoseRegion
        })
    }
}

export function deleteBidiagnose(
    /**
     * The visual number of the diagnose, so it starts at 1
     */
    index: number,
) {
    return async (page: Page) => {
        await test.step(`Delete bidiagnose at index ${index}`, async () => {
            const bidiagnoseRegion = page.getByRole('region', { name: 'Bidiagnoser', exact: true })
            await expect(bidiagnoseRegion).toBeVisible()

            const bidiagnoseGroup = bidiagnoseRegion.getByRole('group', {
                name: `Bidiagnose ${index}`,
            })
            await bidiagnoseGroup.getByRole('button', { name: 'Slett' }).click()
        })
    }
}

export function editBidiagnose({
    search,
    select,
    index,
}: {
    search: string
    select: RegExp
    /**
     * The visual number of the diagnose, so it starts at 1
     */
    index: number
}) {
    return async (page: Page) => {
        await test.step('Edit bidiagnose', async () => {
            const bidiagnoseRegion = page.getByRole('region', { name: 'Bidiagnoser', exact: true })
            await expect(bidiagnoseRegion).toBeVisible()

            const bidiagnoseGroup = bidiagnoseRegion.getByRole('group', { name: `Bidiagnose ${index}` })
            await bidiagnoseGroup.getByRole('button', { name: 'Endre' }).click()
            await bidiagnoseGroup.getByRole('combobox', { name: 'Bidiagnose' }).fill(search)
            await bidiagnoseGroup.getByRole('option', { name: select }).click()
        })
    }
}

export function fillArbeidsforhold({
    harFlereArbeidsforhold,
    sykmeldtFraArbeidsforhold = null,
}: {
    harFlereArbeidsforhold: boolean
    sykmeldtFraArbeidsforhold?: string | null
}) {
    return async (page: Page) => {
        await test.step(`Set flere arbeidsforhold to ${harFlereArbeidsforhold ? 'Ja' : 'Nei'}`, async () => {
            if (harFlereArbeidsforhold) {
                await page.getByRole('group', { name: 'Har pasienten flere arbeidsforhold?' }).getByText('Ja').click()
                await page
                    .getByRole('textbox', { name: 'Hvilke arbeidsforhold skal pasienten sykmeldes fra?' })
                    .fill(sykmeldtFraArbeidsforhold || '')
            } else {
                await page.getByRole('group', { name: 'Har pasienten flere arbeidsforhold?' }).getByText('Nei').click()
            }
        })
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
        await test.step(`Input sykmeldingsperiode to ${toReadableDatePeriod(fom, tom)}`, async () => {
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
        })
    }
}

export function fillArsakerTilAktivitetIkkeMulig({}) {
    return async (page: Page) => {
        await test.step('Input årsaker til aktivitet ikke mulig', async () => {
            const periodeRegion = page.getByRole('region', { name: 'Periode' })
            await expect(periodeRegion).toBeVisible()
            expect(
                await periodeRegion
                    .getByRole('checkbox', { name: 'Medisinske årsaker forhindrer arbeidsaktivitet' })
                    .isChecked(),
            ).toBeTruthy()
            await periodeRegion
                .getByRole('checkbox', { name: 'Arbeidsrelaterte årsaker forhindrer arbeidsaktivitet' })
                .check()
            await periodeRegion.getByRole('checkbox', { name: 'Tilrettelegging ikke mulig' }).check()
            await periodeRegion.getByRole('checkbox', { name: 'Annet' }).check()
            await periodeRegion
                .getByRole('textbox', { name: 'Annen arbeidsrelatert årsak' })
                .fill('Annen årsak til aktivitet ikke mulig')
        })
    }
}

export function fillTilbakedatering({ contact, reason }: { contact: string; reason: string }) {
    return async (page: Page) => {
        await test.step(`Input tilbakedateringsdato to ${contact}`, async () => {
            const region = page.getByRole('region', { name: 'Tilbakedatering' })
            await expect(region).toBeVisible()

            await region.getByRole('textbox', { name: 'Når tok pasienten først kontakt' }).fill(inputDate(contact))
            await region.getByRole('textbox', { name: 'Oppgi årsak for tilbakedatering' }).fill(reason)
        })
    }
}

export function fillAndreSporsmal({
    svangerskapsrelatert,
    yrkesskade,
    yrkesskadeDato,
}: {
    svangerskapsrelatert: boolean
    yrkesskade: boolean
    yrkesskadeDato: string | null
}) {
    return async (page: Page) => {
        await test.step(`Toggle andre sporsmål${yrkesskadeDato != null ? ', and input skadedato' : ''}`, async () => {
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

            if (yrkesskadeDato) {
                await region.getByRole('textbox', { name: 'Dato for yrkesskade' }).fill(inputDate(yrkesskadeDato))
            }
        })
    }
}

export function fillMeldinger({ tilNav, tilArbeidsgiver }: { tilNav: string | null; tilArbeidsgiver: string | null }) {
    return async (page: Page) => {
        await test.step(`Input meldinger to Nav and arbeidsgiver`, async () => {
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
        })
    }
}

export function submitSykmelding() {
    return async (page: Page): Promise<GraphQLRequest> => {
        return test.step('Submit the sykmelding', async () => {
            const request = await clickAndWait(
                page.getByRole('button', { name: 'Send inn' }).click(),
                waitForGqlRequest(OpprettSykmeldingDocument)(page),
            )
            return request.postDataJSON()
        })
    }
}

export function nextStep() {
    return async (page: Page) => {
        await test.step('Click next step button', async () => {
            const nextButton = page.getByRole('button', { name: 'Neste steg' })
            await expect(nextButton).toBeVisible()
            await nextButton.click()
        })
    }
}

export function saveDraft() {
    return async (page: Page) => {
        await test.step('Click save draft button', async () => {
            const nextButton = page.getByRole('button', { name: 'Lagre (utkast)' })
            await expect(nextButton).toBeVisible()
            await nextButton.click()
        })
    }
}

export function previousStep() {
    return async (page: Page) => {
        await test.step('Click previous step button', async () => {
            const previousButton = page.getByRole('button', { name: 'Forrige steg' })
            await expect(previousButton).toBeVisible()
            await previousButton.click()
        })
    }
}
