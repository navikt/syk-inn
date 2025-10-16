import { expect, Locator, Page, test } from '@playwright/test'

import { launchWithMock } from './actions/fhir-actions'
import {
    startNewSykmelding,
    addBidiagnose,
    deleteBidiagnose,
    editBidiagnose,
    pickHoveddiagnose,
    editHoveddiagnose,
} from './actions/user-actions'
import { expectBidagnoses, expectHoveddiagnose } from './actions/user-form-verification'
import { inDays, inputDate } from './utils/date-utils'

test('hoveddiagnose - shall be able to edit diagnose', async ({ page }) => {
    await launchWithMock('empty')(page)
    await startNewSykmelding({ name: 'Espen Eksempel', fnr: '21037712323' })(page)

    // Prefilled
    await expectHoveddiagnose(/L73 - Brudd legg\/ankel/)(page)

    await pickHoveddiagnose({ search: 'Angst', select: /Angstlidelse/ })(page)
    await editHoveddiagnose({ search: 'H75', select: /H75/ })(page)
    await expectHoveddiagnose(/Svulst øre/)(page)
})

test('bidiagnoser - adding, editing, deleting adhd test', async ({ page }) => {
    await launchWithMock('empty')(page)
    await startNewSykmelding({ name: 'Espen Eksempel', fnr: '21037712323' })(page)

    await addBidiagnose({ search: 'P17', select: /Tobakkmisbruk/ })(page)
    await expectBidagnoses(['Tobakkmisbruk'])(page)
    await addBidiagnose({ search: 'A03', select: /Feber/ })(page)
    await expectBidagnoses(['Tobakkmisbruk', 'Feber'])(page)

    await deleteBidiagnose(1)(page)
    await expectBidagnoses(['Feber'])(page)

    await deleteBidiagnose(1)(page)
    await expectBidagnoses([])(page)

    await addBidiagnose({ search: 'P17', select: /Tobakkmisbruk/ })(page)
    await addBidiagnose({ search: 'A03', select: /Feber/ })(page)
    await addBidiagnose({ search: 'S95', select: /Molluscum contagiosum/ })(page)

    await expectBidagnoses(['Tobakkmisbruk', 'Feber', 'Molluscum contagiosum'])(page)
    await editBidiagnose({ index: 2, search: 'L76', select: /Brudd IKA/ })(page)
    await expectBidagnoses(['Tobakkmisbruk', 'Brudd IKA', 'Molluscum contagiosum'])(page)

    await editBidiagnose({ index: 1, search: 'K93', select: /Lungeemboli/ })(page)
    await expectBidagnoses(['Lungeemboli', 'Brudd IKA', 'Molluscum contagiosum'])(page)

    await editBidiagnose({ index: 3, search: 'P80', select: /Personlighetsforstyrrelse/ })(page)
    await expectBidagnoses(['Lungeemboli', 'Brudd IKA', 'Personlighetsforstyrrelse'])(page)

    await deleteBidiagnose(3)(page)
    await deleteBidiagnose(2)(page)
    await deleteBidiagnose(1)(page)

    await expectBidagnoses([])(page)
})

test.describe("'shorthand' date interactions", () => {
    test('when using shorthand on a forlenget sykmelding, the shorhand should be from the start of the forlengelse', async ({
        page,
    }) => {
        await launchWithMock('one-current-to-tomorrow')(page)

        const table = page.getByRole('region', { name: 'Tidligere sykmeldinger og utkast' })
        await table.getByRole('button', { name: 'Forleng sykmeldingen' }).click()

        const periodeRegion = page.getByRole('region', { name: 'Periode' })
        const fom = periodeRegion.getByRole('textbox', { name: 'Fra og med' })
        const tom = periodeRegion.getByRole('textbox', { name: 'Til og med' })

        // Expect that forlengelse pre-filled as expected, it should end tomorrow, forlengelse should be from overmorrow
        await expect(fom).toHaveValue(inputDate(inDays(2)))

        await fom.fill('7d')
        await page.keyboard.press('Enter')

        await expect(fom).toHaveValue(inputDate(inDays(2)))
        await expect(tom).toHaveValue(inputDate(inDays(8)))
    })

    test('when using shorthand on a forlenget sykmelding in the tom field, the shorhand should be from the start of the forlengelse if fom is empty', async ({
        page,
    }) => {
        await launchWithMock('one-current-to-tomorrow')(page)

        const table = page.getByRole('region', { name: 'Tidligere sykmeldinger og utkast' })
        await table.getByRole('button', { name: 'Forleng sykmeldingen' }).click()

        const periodeRegion = page.getByRole('region', { name: 'Periode' })
        const fom = periodeRegion.getByRole('textbox', { name: 'Fra og med' })
        const tom = periodeRegion.getByRole('textbox', { name: 'Til og med' })

        // Expect that forlengelse pre-filled as expected, it should end tomorrow, forlengelse should be from overmorrow
        await expect(fom).toHaveValue(inputDate(inDays(2)))

        await fom.clear()
        await tom.fill('7d')
        await page.keyboard.press('Enter')

        await expect(fom).toHaveValue(inputDate(inDays(2)))
        await expect(tom).toHaveValue(inputDate(inDays(8)))
    })

    test('when using shorthand on n+1 period, the shorhand should be from the tom+1 of the previous period', async ({
        page,
    }) => {
        await launchWithMock('empty')(page)
        await startNewSykmelding()(page)

        const periodeRegion = page.getByRole('region', { name: 'Periode' })
        const fom = periodeRegion.getByRole('textbox', { name: 'Fra og med' })
        const tom = periodeRegion.getByRole('textbox', { name: 'Til og med' })

        await fom.fill('7d')
        await page.keyboard.press('Enter')

        await expect(fom).toHaveValue(inputDate(inDays(0)))
        await expect(tom).toHaveValue(inputDate(inDays(6)))

        await page.getByRole('button', { name: 'Legg til ny periode' }).click()

        const nextPeriodeRegion = page.getByRole('region', { name: 'Periode' }).nth(1)
        const nextFom = nextPeriodeRegion.getByRole('textbox', { name: 'Fra og med' })
        const nextTom = nextPeriodeRegion.getByRole('textbox', { name: 'Til og med' })

        await expect(nextFom).toHaveValue(inputDate(inDays(7)))

        await nextFom.fill('7d')
        await page.keyboard.press('Enter')

        await expect(nextFom).toHaveValue(inputDate(inDays(7)))
        await expect(nextTom).toHaveValue(inputDate(inDays(13)))
    })

    test('when using shorthand on n+1 period, should handle tom shorthands', async ({ page }) => {
        await launchWithMock('empty')(page)
        await startNewSykmelding()(page)

        const periodeRegion = page.getByRole('region', { name: 'Periode' })
        const fom = periodeRegion.getByRole('textbox', { name: 'Fra og med' })
        const tom = periodeRegion.getByRole('textbox', { name: 'Til og med' })

        await tom.fill('7d')
        await page.keyboard.press('Enter')

        await expect(fom).toHaveValue(inputDate(inDays(0)))
        await expect(tom).toHaveValue(inputDate(inDays(6)))

        await page.getByRole('button', { name: 'Legg til ny periode' }).click()

        const nextPeriodeRegion = page.getByRole('region', { name: 'Periode' }).nth(1)
        const nextFom = nextPeriodeRegion.getByRole('textbox', { name: 'Fra og med' })
        const nextTom = nextPeriodeRegion.getByRole('textbox', { name: 'Til og med' })

        await expect(nextFom).toHaveValue(inputDate(inDays(7)))

        await nextTom.fill('7d')
        await page.keyboard.press('Enter')

        await expect(nextFom).toHaveValue(inputDate(inDays(7)))
        await expect(nextTom).toHaveValue(inputDate(inDays(13)))
    })

    test('misc interactions through fom-field', async ({ page }) => {
        await launchWithMock('empty')(page)
        await startNewSykmelding()(page)

        const periodeRegion = page.getByRole('region', { name: 'Periode' })
        const fom = periodeRegion.getByRole('textbox', { name: 'Fra og med' })
        const tom = periodeRegion.getByRole('textbox', { name: 'Til og med' })

        await fom.fill('7d')
        await page.keyboard.press('Enter')

        await expect(fom).toHaveValue(inputDate(inDays(0)))
        await expect(tom).toHaveValue(inputDate(inDays(6)))

        await fom.fill('9d +2')
        await page.keyboard.press('Enter')

        await expect(fom).toHaveValue(inputDate(inDays(2)))
        await expect(tom).toHaveValue(inputDate(inDays(2 + 8)))

        await fom.fill('+3 12d')
        await page.keyboard.press('Enter')

        await expect(fom).toHaveValue(inputDate(inDays(3)))
        await expect(tom).toHaveValue(inputDate(inDays(3 + 11)))
    })

    test('misc interactions through tom-field', async ({ page }) => {
        await launchWithMock('empty')(page)
        await startNewSykmelding()(page)

        const periodeRegion = page.getByRole('region', { name: 'Periode' })
        const fom = periodeRegion.getByRole('textbox', { name: 'Fra og med' })
        const tom = periodeRegion.getByRole('textbox', { name: 'Til og med' })

        // Tom has todays date pre-filled
        await tom.fill('7d')
        await page.keyboard.press('Enter')

        await expect(fom).toHaveValue(inputDate(inDays(0)))
        await expect(tom).toHaveValue(inputDate(inDays(6)))

        // Fom is empty
        await fom.clear()
        await tom.fill('9d')
        await page.keyboard.press('Enter')

        await expect(fom).toHaveValue(inputDate(inDays(0)))
        await expect(tom).toHaveValue(inputDate(inDays(8)))

        // Fom already has date that is not today
        await fom.fill(inputDate(inDays(3)))
        await tom.fill('9d')
        await page.keyboard.press('Enter')

        await expect(fom).toHaveValue(inputDate(inDays(3)))
        await expect(tom).toHaveValue(inputDate(inDays(3 + 8)))

        // Fom already has date that is not today and we input with offset
        await fom.fill(inputDate(inDays(3)))
        await tom.fill('12d +5')
        await page.keyboard.press('Enter')

        // Offset is still applied from the given fom (is that the best behaviour?)
        await expect(fom).toHaveValue(inputDate(inDays(5 + 3)))
        await expect(tom).toHaveValue(inputDate(inDays(5 + 3 + 11)))
    })

    test('should display popover with hint for fom field', async ({ page }) => {
        await launchWithMock('empty')(page)
        await startNewSykmelding()(page)

        const periodeRegion = page.getByRole('region', { name: 'Periode' })
        const fom = periodeRegion.getByRole('textbox', { name: 'Fra og med' })

        await fom.fill('7d')

        const popover = periodeRegion.getByRole('region', { name: 'Trykk Enter for å bruke følgende datoer' })
        await expect(popover).toBeVisible()
        await expect(popover).toHaveText(/Fra .* \d{1,2}\. .* til .* \d{1,2}\. .*/)
    })

    test('should display popover with hint for tom field', async ({ page }) => {
        await launchWithMock('empty')(page)
        await startNewSykmelding()(page)

        const periodeRegion = page.getByRole('region', { name: 'Periode' })
        const tom = periodeRegion.getByRole('textbox', { name: 'Til og med' })

        await tom.fill('7d')

        const popover = periodeRegion.getByRole('region', { name: 'Trykk Enter for å bruke følgende datoer' })
        await expect(popover).toBeVisible()
        await expect(popover).toHaveText(/Fra .* \d{1,2}\. .* til .* \d{1,2}\. .*/)
    })
})

test.describe('periode ranges', () => {
    async function fillPeriode(
        page: Page,
        values: { nth: number; fom: number | { expect: number }; tom: number },
    ): Promise<[Locator]> {
        const periode = page.getByRole('region', { name: 'Periode' }).nth(values.nth)
        const fom = periode.getByRole('textbox', { name: 'Fra og med' })
        if (typeof values.fom !== 'number') {
            await expect(periode.getByRole('textbox', { name: 'Fra og med' })).toHaveValue(inputDate(inDays(7)))
        } else {
            await fom.fill(inputDate(inDays(values.fom)))
        }
        await periode.getByRole('textbox', { name: 'Til og med' }).fill(inputDate(inDays(values.tom)))
        await periode.getByRole('textbox', { name: 'Sykmeldingsgrad (%)' }).fill('60')

        return [fom]
    }

    test('simple happy path, ranges are back to back everyone is happy', async ({ page }) => {
        await launchWithMock('empty')(page)
        await startNewSykmelding()(page)

        await fillPeriode(page, { nth: 0, fom: 0, tom: 6 })
        await page.getByRole('button', { name: 'Legg til ny periode' }).click()
        await fillPeriode(page, { nth: 1, fom: { expect: 7 }, tom: 13 })

        await page.getByRole('button', { name: 'Neste steg' }).click()
        await expect(page.getByRole('heading', { name: 'Oppsummering' })).toBeVisible()
    })

    test('overlapping one day should give validation error', async ({ page }) => {
        await launchWithMock('empty')(page)
        await startNewSykmelding()(page)

        await fillPeriode(page, { nth: 0, fom: 0, tom: 6 })
        await page.getByRole('button', { name: 'Legg til ny periode' }).click()
        const [fom] = await fillPeriode(page, { nth: 1, fom: 6, tom: 13 })

        await page.getByRole('button', { name: 'Neste steg' }).click()
        await expect(fom).toHaveAccessibleDescription('Periode kan ikke overlappe med forrige periode')
    })

    test('one day gap should give validation error', async ({ page }) => {
        await launchWithMock('empty')(page)
        await startNewSykmelding()(page)

        await fillPeriode(page, { nth: 0, fom: 0, tom: 6 })
        await page.getByRole('button', { name: 'Legg til ny periode' }).click()
        const [fom] = await fillPeriode(page, { nth: 1, fom: 8, tom: 13 })

        await page.getByRole('button', { name: 'Neste steg' }).click()
        await expect(fom).toHaveAccessibleDescription('Det kan ikke være opphold mellom perioder')
    })
})
