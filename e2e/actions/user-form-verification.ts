import { expect, Locator, Page, test } from '@playwright/test'
import { add } from 'date-fns'

import { toReadableDatePeriod } from '#lib/date'
import { daysAgo, inputDate } from '#lib/test/date-utils'
import { AnnenFravarsgrunnArsak } from '#queries'

export function expectPatient(patient: { name: string; fnr: string }) {
    return async (region: Locator) => {
        await test.step(`verify that the patient is ${patient.name}`, async () => {
            await expect(region).toBeVisible()
            await expect(region.getByText(new RegExp(patient.name))).toBeVisible()
            await expect(region.getByText(new RegExp(`ID-nummer(.*)${patient.fnr}`))).toBeVisible()
        })
    }
}

export function expectPeriode({
    type,
    ...params
}: {
    type: '100%' | { behandlingsdager: number } | { reisetilskudd: true; grad: 'FULL' | number } | { grad: number }
} & ({ days: number } | { fromRelative: number; days: number })) {
    const [fomRelativeToToday, tomRelativeToToday] =
        'fromRelative' in params ? [params.fromRelative, params.fromRelative + params.days] : [0, params.days]

    const fom = add(new Date(), { days: fomRelativeToToday })
    const tom = add(new Date(), { days: tomRelativeToToday })

    return async (page: Page) => {
        const stepDescription =
            typeof type === 'string' && type === '100%' ? '100%' : 'grad' in type ? `${type.grad}%` : 'behandlingsdager'

        await test.step(`Verify aktivitet to be ${toReadableDatePeriod(fom, tom)} (${stepDescription})`, async () => {
            const periodeTitle =
                typeof type !== 'string' && 'behandlingsdager' in type
                    ? 'Periode for enkeltstående behandlingsdager'
                    : typeof type !== 'string' && 'reisetilskudd' in type
                      ? 'Periode for reisetilskudd'
                      : 'Periode'

            const periodeRegion = page.getByRole('region', { name: periodeTitle })
            await expect(periodeRegion.getByRole('textbox', { name: 'Fra og med' })).toHaveValue(inputDate(fom))
            await expect(periodeRegion.getByRole('textbox', { name: 'Til og med' })).toHaveValue(inputDate(tom))

            if (typeof type === 'string' && type === '100%') {
                await expect(periodeRegion.getByRole('combobox', { name: 'Mulighet for arbeid' })).toHaveValue(
                    'AKTIVITET_IKKE_MULIG',
                )
            } else if ('reisetilskudd' in type) {
                if (typeof type.grad === 'string') {
                    await expect(
                        page
                            .getByRole('radiogroup', {
                                name: /Mulighet for arbeid ved bruk av reisetilskudd/,
                            })
                            .getByRole('radio', { name: 'Kan være 100% i arbeid' }),
                    ).toBeChecked()
                } else {
                    await expect(
                        page
                            .getByRole('radiogroup', {
                                name: /Mulighet for arbeid ved bruk av reisetilskudd/,
                            })
                            .getByRole('radio', { name: 'Kan jobbe gradert' }),
                    ).toBeChecked()

                    await expect(
                        page.getByRole('textbox', { name: /Sykmeldingsgrad ved bruk av reisetilskudd/ }),
                    ).toHaveValue(`${type.grad}`)
                }
            } else if ('grad' in type) {
                await expect(periodeRegion.getByRole('combobox', { name: 'Mulighet for arbeid' })).toHaveValue(
                    'GRADERT',
                )
                await expect(periodeRegion.getByRole('textbox', { name: 'Sykmeldingsgrad (%)\n' })).toHaveValue(
                    `${type.grad}`,
                )
            } else {
                await expect(periodeRegion).toHaveText(
                    new RegExp(`${type.behandlingsdager} behandlingsdag${type.behandlingsdager > 1 ? 'er' : ''}`),
                )
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

export function expectAnnenLovpalagtFravarsgrunn(expectedFravarsgrunn: AnnenFravarsgrunnArsak) {
    return async (page: Page) => {
        return test.step(`Verify that annen lovfestet fraværsgrunn is ${expectedFravarsgrunn}`, async () => {
            const group = page.getByRole('group', { name: 'Annen lovfestet fraværsgrunn' })

            await expect(
                group.getByRole('checkbox', { name: 'Sykmeldingen har en annen lovfestet fraværsgrunn' }),
            ).toBeChecked()
            await expect(group.getByRole('combobox', { name: 'Velg lovfestet fraværsgrunn' })).toHaveValue(
                expectedFravarsgrunn,
            )
        })
    }
}

export function expectSvangerskapsrelatert(svangerskapsrelatert: boolean) {
    return async (page: Page) => {
        await test.step('Verify svangerskapsrelatert toggle', async () => {
            const vurderingSection = page.getByRole('region', { name: 'Diagnose' })

            const svangerskapsCheckbox = vurderingSection.getByRole('checkbox', {
                name: 'Sykdommen er svangerskapsrelatert',
            })

            if (svangerskapsrelatert) {
                await expect(svangerskapsCheckbox).toBeChecked()
            } else {
                await expect(svangerskapsCheckbox).not.toBeChecked()
            }
        })
    }
}

export function expectYrkesskade({
    yrkesskade,
    yrkesskadeDato,
}: {
    yrkesskade: boolean
    yrkesskadeDato: Date | string
}) {
    return async (page: Page) => {
        await test.step('Verify yrkesskade', async () => {
            const vurderingRegion = page.getByRole('region', { name: 'Vurderinger for Nav' })
            const yrkesskadeCheckbox = vurderingRegion.getByRole('checkbox', {
                name: 'Sykmeldingen kan skyldes en yrkesskade/yrkessykdom',
            })

            if (yrkesskade) {
                await expect(yrkesskadeCheckbox).toBeChecked()
            } else {
                await expect(yrkesskadeCheckbox).not.toBeChecked()
            }
            await expect(vurderingRegion.getByRole('textbox', { name: 'Eventuell skadedato' })).toHaveValue(
                inputDate(yrkesskadeDato),
            )
        })
    }
}

export function expectInnspillTilArbeidsgiver(tilArbeidsgiver: string | null) {
    return async (page: Page) => {
        await test.step('Verify "Innspill til arbeidsgiver" field', async () => {
            if (tilArbeidsgiver) {
                await expect(page.getByRole('checkbox', { name: 'Innspill til arbeidsgiver' })).toBeChecked()
                await expect(page.getByRole('textbox', { name: 'Melding til arbeidsgiver' })).toHaveValue(
                    tilArbeidsgiver,
                )
            } else {
                await expect(page.getByRole('checkbox', { name: 'Innspill til arbeidsgiver' })).not.toBeChecked()
            }
        })
    }
}

export function expectMeldingTilNav(tilNav: string | null) {
    return async (page: Page) => {
        await test.step('Verify Melding til NAV', async () => {
            const meldingerRegion = page.getByRole('region', { name: 'Vurderinger for Nav' })

            if (await meldingerRegion.getByRole('button', { name: 'Vis mer' }).isVisible()) {
                await meldingerRegion.getByRole('button', { name: 'Vis mer' }).click()
            }

            if (tilNav) {
                await expect(meldingerRegion.getByRole('textbox', { name: 'Melding til Nav' })).toHaveValue(tilNav)
                // Only check toggle state if provided, undefined means we don't care
            } else if (tilNav !== undefined) {
                await expect(meldingerRegion.getByRole('checkbox', { name: 'Melding til Nav' })).not.toBeChecked()
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

            const harFlereArbeidsforholdGroup = arbeidsforholdRegion.getByRole('radiogroup', {
                name: /Har pasienten flere arbeidsgivere?/,
            })
            if (harFlereArbeidsforhold) {
                await expect(harFlereArbeidsforholdGroup.getByRole('radio', { name: 'Ja' })).toBeChecked()
            } else {
                await expect(harFlereArbeidsforholdGroup.getByRole('radio', { name: 'Nei' })).not.toBeChecked()
            }

            if (sykmeldtFraArbeidsforhold) {
                await expect(
                    arbeidsforholdRegion.getByRole('textbox', {
                        name: 'Hvilken arbeidsgiver skal pasienten sykmeldes fra?',
                    }),
                ).toHaveValue(sykmeldtFraArbeidsforhold)
            }
        })
    }
}

export function expectBehandlingsdagerForklaring(description: string) {
    return async (page: Page) => {
        await test.step('Verify Behandlingsdager description', async () => {
            await expect(
                page.getByRole('textbox', { name: 'Beskrivelse av behov for behandlingsdager (ikke påkrevd)' }),
            ).toHaveValue(description)
        })
    }
}
