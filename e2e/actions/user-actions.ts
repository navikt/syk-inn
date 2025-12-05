import { expect, Locator, Page, test } from '@playwright/test'
import { add } from 'date-fns'
import { ApolloLink } from '@apollo/client'
import { OpprettSykmeldingDocument } from '@queries'
import { toReadableDatePeriod } from '@lib/date'
import { MockRuleMarkers } from '@dev/mock-engine/SykInnApiMockRuleMarkers'
import { inputDate } from '@lib/test/date-utils'

import { clickAndWait, getDraftId, waitForGqlRequest } from '../utils/request-utils'

export function pickHoveddiagnose({ search, select }: { search: string; select: RegExp }) {
    return async (page: Page) => {
        return await test.step('Input hoveddiagnose', async () => {
            const diagnoseRegion = page.getByRole('region', { name: 'Diagnose', exact: true })
            await expect(diagnoseRegion).toBeVisible()

            const endreButton = page.getByRole('button', { name: 'Endre' })
            if (await endreButton.isVisible()) {
                await endreButton.click() // Diagnose is pre-filled
            }
            await diagnoseRegion.getByRole('combobox', { name: 'Hoveddiagnose' }).fill(search)
            await diagnoseRegion.getByRole('option', { name: select }).click()

            return diagnoseRegion
        })
    }
}

export function editHoveddiagnose({ search, select }: { search: string; select: RegExp }) {
    return async (page: Page) => {
        await test.step(`Edit hoveddiagnose to ${search}`, async () => {
            const diagnoseRegion = page.getByRole('region', { name: 'Diagnose', exact: true })
            await expect(diagnoseRegion).toBeVisible()

            await diagnoseRegion.getByRole('button', { name: 'Endre' }).click()
            await diagnoseRegion.getByRole('combobox', { name: 'Hoveddiagnose' }).fill(search)
            await diagnoseRegion.getByRole('option', { name: select }).click()
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

export function addUtdypendeSporsmal({
    utfordringerMedArbeid,
    medisinskOppsummering,
    hensynPaArbeidsplassen,
}: {
    utfordringerMedArbeid: string
    medisinskOppsummering: string
    hensynPaArbeidsplassen?: string
}) {
    return async (page: Page) => {
        await test.step('Add utdypende spørsmål uke 8', async () => {
            const utdypendeSporsmalRegion = page.getByRole('region', { name: 'Utdypende spørsmål uke 8', exact: true })
            await expect(utdypendeSporsmalRegion).toBeVisible()

            await utdypendeSporsmalRegion
                .getByRole('textbox', { name: 'Hvilke utfordringer har pasienten med å utføre gradert arbeid?' })
                .fill(utfordringerMedArbeid)
            await utdypendeSporsmalRegion
                .getByRole('textbox', {
                    name: 'Gi en kort medisinsk oppsummering av tilstanden (sykehistorie, hovedsymptomer, pågående/planlagt behandling)',
                })
                .fill(medisinskOppsummering)
            if (hensynPaArbeidsplassen) {
                await utdypendeSporsmalRegion
                    .getByRole('textbox', {
                        name: 'Hvilke hensyn må være på plass for at pasienten kan prøves i det nåværende arbeidet? (ikke obligatorisk)',
                    })
                    .fill(hensynPaArbeidsplassen)
            }
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
}: { type: '100%' | { grad: number } } & (
    | { days: number; nth?: number }
    | { fromRelative: number; days: number; nth?: number }
)) {
    const [fomRelativeToToday, tomRelativeToToday] =
        'fromRelative' in params ? [params.fromRelative, params.fromRelative + params.days] : [0, params.days]

    const fom = add(new Date(), { days: fomRelativeToToday })
    const tom = add(new Date(), { days: tomRelativeToToday })
    const nth = params.nth ?? 0

    return async (page: Page) => {
        return await test.step(`Input sykmeldingsperiode to ${toReadableDatePeriod(fom, tom)}`, async () => {
            const periodeRegion = page.getByRole('region', { name: 'Periode' }).nth(nth)
            await expect(periodeRegion).toBeVisible()

            const fomField = periodeRegion.getByRole('textbox', { name: 'Fra og med' })
            await fomField.fill(inputDate(fom))
            const tomField = periodeRegion.getByRole('textbox', { name: 'Til og med' })
            await tomField.fill(inputDate(tom))

            if (typeof type === 'string' && type === '100%') {
                await periodeRegion
                    .getByRole('combobox', { name: 'Mulighet for arbeid' })
                    .selectOption('Aktivitet ikke mulig')
            }

            if (typeof type !== 'string' && 'grad' in type) {
                await periodeRegion
                    .getByRole('combobox', { name: 'Mulighet for arbeid' })
                    .selectOption('Gradert sykmelding')

                await periodeRegion.getByRole('textbox', { name: 'Sykmeldingsgrad (%)' }).fill(`${type.grad}`)
            }

            return [fomField, tomField]
        })
    }
}

export function fillArsakerTilAktivitetIkkeMulig({
    isMedisinsk = true,
    isArbeidsrelatert = false,
    arbeidsrelaterteArsaker = [],
    arbeidsrelatertArsakBegrunnelse = null,
}: {
    isMedisinsk?: boolean
    isArbeidsrelatert?: boolean
    arbeidsrelaterteArsaker?: ('tilrettelegging ikke mulig' | 'annet')[]
    arbeidsrelatertArsakBegrunnelse?: string | null
}) {
    return async (page: Page) => {
        await test.step('Input årsaker til aktivitet ikke mulig', async () => {
            const periodeRegion = page.getByRole('region', { name: 'Periode' })
            await expect(periodeRegion).toBeVisible()

            const medisinskCheckbox = periodeRegion.getByRole('checkbox', {
                name: 'Medisinske årsaker forhindrer arbeidsaktivitet',
            })
            if (isMedisinsk) {
                await expect(medisinskCheckbox).toBeChecked()
            } else {
                await medisinskCheckbox.uncheck()
            }

            const arbeidsrelatertArsakCheckbox = periodeRegion.getByRole('checkbox', {
                name: 'Arbeidsrelaterte årsaker forhindrer arbeidsaktivitet',
            })
            if (isArbeidsrelatert) {
                await arbeidsrelatertArsakCheckbox.check()
            } else {
                await expect(arbeidsrelatertArsakCheckbox).not.toBeChecked()
            }

            if (arbeidsrelaterteArsaker.includes('tilrettelegging ikke mulig')) {
                await periodeRegion.getByRole('checkbox', { name: 'Tilrettelegging ikke mulig' }).check()
            }
            if (arbeidsrelaterteArsaker.includes('annet')) {
                await periodeRegion.getByRole('checkbox', { name: 'Annet' }).check()
            }

            if (arbeidsrelatertArsakBegrunnelse) {
                await periodeRegion
                    .getByRole('textbox', { name: 'Annen arbeidsrelatert årsak' })
                    .fill(arbeidsrelatertArsakBegrunnelse)
            }
        })
    }
}

export function fillTilbakedatering({
    contact,
    reason,
    otherReason,
}: {
    contact: string
    reason: string
    otherReason?: string
}) {
    return async (page: Page) => {
        await test.step(`Input tilbakedateringsdato to ${contact}`, async () => {
            const region = page.getByRole('region', { name: 'Tilbakedatering' })
            await expect(region).toBeVisible()

            await region.getByRole('textbox', { name: 'Når tok pasienten først kontakt' }).fill(inputDate(contact))
            await region.getByRole('combobox', { name: 'Velg årsak for tilbakedatering' }).selectOption(reason)
            if (reason === 'Annet' && otherReason) {
                await region.getByRole('textbox', { name: 'Oppgi årsak for tilbakedatering' }).fill(otherReason)
            }
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
                await region.getByRole('textbox', { name: 'Melding til Nav' }).fill(tilNav)
            }

            if (tilArbeidsgiver) {
                await region.getByRole('checkbox', { name: 'Melding til arbeidsgiver' }).check()
                await region.getByRole('textbox', { name: 'Innspill til arbeidsgiver' }).fill(tilArbeidsgiver)
            }
        })
    }
}

export function submitSykmelding(
    outcome: 'succeed' | 'invalid' | 'manual' | 'invalid-unexpected' | 'person-not-found' = 'succeed',
) {
    async function setFailParam(
        page: Page,
        outcome: 'invalid' | 'manual' | 'invalid-unexpected' | 'person-not-found',
    ): Promise<void> {
        await page.evaluate(
            ({ paramName, outcome }) => {
                const u = new URL(location.href)
                u.searchParams.set(paramName, outcome)
                history.replaceState(null, '', u)
            },
            { paramName: MockRuleMarkers.query, outcome },
        )
    }
    return async (page: Page): Promise<{ request: ApolloLink.Request; draftId: string }> => {
        return test.step(`Submit the sykmelding (outcome: ${outcome})`, async () => {
            if (outcome !== 'succeed') {
                await setFailParam(page, outcome)
            }

            /**
             * Get the draftId from the URL before we submit, as a successful submission will redirect
             */
            const draftIdInUrl = getDraftId(page) ?? 'missing'

            const request = await clickAndWait(
                page.getByRole('button', { name: 'Send inn' }).click(),
                waitForGqlRequest(OpprettSykmeldingDocument)(page),
            )
            return { request: request.postDataJSON(), draftId: draftIdInUrl }
        })
    }
}

export function confirmRuleOutcomeSubmit(modal: Locator) {
    return async (page: Page): Promise<{ request: ApolloLink.Request; draftId: string }> => {
        return test.step(`Confirm the sykmelding should be submit with rule outcome`, async () => {
            /**
             * Get the draftId from the URL before we submit, as a successful submission will redirect
             */
            const draftIdInUrl = getDraftId(page) ?? 'missing'

            const request = await clickAndWait(
                modal.getByRole('button', { name: 'Send inn' }).click(),
                waitForGqlRequest(OpprettSykmeldingDocument)(page),
            )
            return { request: request.postDataJSON(), draftId: draftIdInUrl }
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

export function requestAccessToSykmeldinger() {
    return async (page: Page) => {
        await test.step('Request access to sykmeldinger', async () => {
            const region = page.getByRole('region', { name: 'Historiske sykmeldinger' })
            await expect(region).toBeVisible()

            const requestAccessButton = region.getByRole('button', { name: 'Vis tidligere sykmeldinger' })
            await expect(requestAccessButton).toBeVisible()
            await requestAccessButton.click()
            await requestAccessButton.waitFor({ state: 'hidden' })
        })
    }
}
