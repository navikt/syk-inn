import { expect, Page, test } from '@playwright/test'
import { add } from 'date-fns'

import { toReadableDatePeriod } from '@lib/date'

import { daysAgo, inputDate } from '../utils/date-utils'

export function expectPeriode({
    type,
    ...params
}: { type: '100%' | { grad: number } } & ({ days: number } | { fromRelative: number; days: number })) {
    const [fomRelativeToToday, tomRelativeToToday] =
        'fromRelative' in params ? [params.fromRelative, params.fromRelative + params.days] : [0, params.days]

    const fom = add(new Date(), { days: fomRelativeToToday })
    const tom = add(new Date(), { days: tomRelativeToToday })

    return async (page: Page) => {
        await test.step(`Verify aktivitet to be ${toReadableDatePeriod(fom, tom)} (${typeof type === 'string' && type === '100%' ? '100%' : `${type.grad}%`})`, async () => {
            const periodeRegion = page.getByRole('region', { name: 'Periode' })
            await expect(periodeRegion.getByRole('textbox', { name: 'Fra og med' })).toHaveValue(inputDate(fom))
            await expect(periodeRegion.getByRole('textbox', { name: 'Til og med' })).toHaveValue(inputDate(tom))

            if (typeof type === 'string' && type === '100%') {
                await expect(periodeRegion.getByRole('combobox', { name: 'Mulighet for arbeid' })).toHaveValue(
                    'AKTIVITET_IKKE_MULIG',
                )
            } else {
                await expect(periodeRegion.getByRole('combobox', { name: 'Mulighet for arbeid' })).toHaveValue(
                    'GRADERT',
                )
                await expect(periodeRegion.getByRole('textbox', { name: 'Sykmeldingsgrad (%)\n' })).toHaveValue('65')
            }
        })
    }
}

export function expectTilbakedatering({ daysAgo: daysAgoValue, reason }: { daysAgo: number; reason: string }) {
    return async (page: Page) => {
        await test.step(`Verify tilbakedatering: ${inputDate(daysAgo(daysAgoValue))}, reason: ${reason}`, async () => {
            const tilbakedateringRegion = page.getByRole('region', { name: 'Tilbakedatering' })
            await expect(
                tilbakedateringRegion.getByRole('textbox', { name: 'Når tok pasienten først kontakt' }),
            ).toHaveValue(inputDate(daysAgo(daysAgoValue)))
            await expect(
                tilbakedateringRegion.getByRole('combobox', { name: 'Velg årsak for tilbakedatering' }),
            ).toHaveValue(reason)
        })
    }
}

export function expectHoveddiagnose(expectedDiagnose: string | RegExp) {
    return async (page: Page) => {
        await test.step(`Verify hoveddiagnose: ${expectedDiagnose}`, async () => {
            const diagnoseRegion = page.getByRole('region', { name: 'Diagnose', exact: true })
            await expect(diagnoseRegion).toHaveText(new RegExp(expectedDiagnose))
        })
    }
}

export function expectBidagnoses(expectedBidiagnoses: string[]) {
    return async (page: Page) => {
        await test.step(`Verify ${expectedBidiagnoses.length} bidiagnoses`, async () => {
            const bidiagnoseRegion = page.getByRole('region', { name: 'Bidiagnoser', exact: true })
            await expect(bidiagnoseRegion).toBeVisible()

            const bidiagnoses = bidiagnoseRegion.getByRole('group', { name: /Bidiagnose \d+/, exact: true })
            await expect(
                bidiagnoses,
                `Expected ${expectedBidiagnoses.length} bidiagnoses, but got ${await bidiagnoses.count()}`,
            ).toHaveCount(expectedBidiagnoses.length)

            for (let index = 0; index < expectedBidiagnoses.length; index++) {
                await expect(bidiagnoses.nth(index)).toHaveText(new RegExp(expectedBidiagnoses[index]))
            }
        })
    }
}

export function expectAndreSporsmal({
    svangerskapsrelatert,
    yrkesskade,
    yrkesskadeDato,
}: {
    svangerskapsrelatert: boolean
    yrkesskade: boolean
    yrkesskadeDato: Date | string
}) {
    return async (page: Page) => {
        await test.step('Verify Andre spørsmål section', async () => {
            const andreSporsmalRegion = page.getByRole('region', { name: 'Andre spørsmål' })

            const svangerskapsCheckbox = andreSporsmalRegion.getByRole('checkbox', {
                name: 'Sykdommen er svangerskapsrelatert',
            })
            const yrkesskadeCheckbox = andreSporsmalRegion.getByRole('checkbox', {
                name: 'Sykmeldingen kan skyldes en yrkesskade/yrkessykdom',
            })
            if (svangerskapsrelatert) {
                await expect(svangerskapsCheckbox).toBeChecked()
            } else {
                await expect(svangerskapsCheckbox).not.toBeChecked()
            }
            if (yrkesskade) {
                await expect(yrkesskadeCheckbox).toBeChecked()
            } else {
                await expect(yrkesskadeCheckbox).not.toBeChecked()
            }
            await expect(andreSporsmalRegion.getByRole('textbox', { name: 'Dato for yrkesskade' })).toHaveValue(
                inputDate(yrkesskadeDato),
            )
        })
    }
}

export function expectMeldinger({
    tilNav,
    tilArbeidsgiver,
}: {
    tilNav: string | null
    tilArbeidsgiver: string | null
}) {
    return async (page: Page) => {
        await test.step('Verify Meldinger section', async () => {
            const meldingerRegion = page.getByRole('region', { name: 'Meldinger' })

            if (await meldingerRegion.getByRole('button', { name: 'Vis mer' }).isVisible()) {
                await meldingerRegion.getByRole('button', { name: 'Vis mer' }).click()
            }

            if (tilNav) {
                await expect(
                    meldingerRegion.getByRole('textbox', { name: 'Har du noen tilbakemeldinger?' }),
                ).toHaveValue(tilNav)
            } else {
                await expect(
                    meldingerRegion.getByRole('textbox', { name: 'Har du noen tilbakemeldinger?' }),
                ).toBeEmpty()
            }

            if (tilArbeidsgiver) {
                await expect(meldingerRegion.getByRole('textbox', { name: 'Innspill til arbeidsgiver' })).toHaveValue(
                    tilArbeidsgiver,
                )
            } else {
                await expect(meldingerRegion.getByRole('textbox', { name: 'Innspill til arbeidsgiver' })).toBeEmpty()
            }
        })
    }
}

export function expectArbeidsforhold({
    harFlereArbeidsforhold,
    sykmeldtFraArbeidsforhold = null,
}: {
    harFlereArbeidsforhold: boolean
    sykmeldtFraArbeidsforhold?: string | null
}) {
    return (page: Page) => {
        return test.step('Verify Arbeidsforhold section', async () => {
            const arbeidsforholdRegion = page.getByRole('region', { name: 'Arbeidsgiver' })

            const harFlereArbeidsforholdGroup = arbeidsforholdRegion.getByRole('group', {
                name: 'Har pasienten flere arbeidsforhold?',
            })
            if (harFlereArbeidsforhold) {
                await expect(harFlereArbeidsforholdGroup.getByRole('radio', { name: 'Ja' })).toBeChecked()
            } else {
                await expect(harFlereArbeidsforholdGroup.getByRole('radio', { name: 'Nei' })).not.toBeChecked()
            }

            if (sykmeldtFraArbeidsforhold) {
                await expect(
                    arbeidsforholdRegion.getByRole('textbox', {
                        name: 'Hvilke arbeidsforhold skal pasienten sykmeldes fra?',
                    }),
                ).toHaveValue(sykmeldtFraArbeidsforhold)
            }
        })
    }
}
