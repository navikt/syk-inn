import { expect, test } from '@playwright/test'

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
    await editHoveddiagnose({ search: 'D290', select: /D290/ })(page)
    await expectHoveddiagnose(/Godartet svulst i/)(page)
})

test('bidiagnoser - adding, editing, deleting adhd test', async ({ page }) => {
    await launchWithMock('empty')(page)
    await startNewSykmelding({ name: 'Espen Eksempel', fnr: '21037712323' })(page)

    await addBidiagnose({ search: 'B600', select: /Babesiose/ })(page)
    await expectBidagnoses(['Babesiose'])(page)
    await addBidiagnose({ search: 'A931', select: /Sandfluefeber/ })(page)
    await expectBidagnoses(['Babesiose', 'Sandfluefeber'])(page)

    await deleteBidiagnose(1)(page)
    await expectBidagnoses(['Sandfluefeber'])(page)

    await deleteBidiagnose(1)(page)
    await expectBidagnoses([])(page)

    await addBidiagnose({ search: 'B600', select: /Babesiose/ })(page)
    await addBidiagnose({ search: 'A931', select: /Sandfluefeber/ })(page)
    await addBidiagnose({ search: 'R772', select: /Alfaføtoproteinabnormitet/ })(page)

    await expectBidagnoses(['Babesiose', 'Sandfluefeber', 'Alfaføtoproteinabnormitet'])(page)
    await editBidiagnose({ index: 2, search: 'S022', select: /Brudd i neseben;lukket/ })(page)
    await expectBidagnoses(['Babesiose', 'Brudd i neseben;lukket', 'Alfaføtoproteinabnormitet'])(page)

    await editBidiagnose({ index: 1, search: 'A051', select: /Botulisme/ })(page)
    await expectBidagnoses(['Botulisme', 'Brudd i neseben;lukket', 'Alfaføtoproteinabnormitet'])(page)

    await editBidiagnose({ index: 3, search: 'F609', select: /Uspesifisert personlighetsforstyrrelse/ })(page)
    await expectBidagnoses(['Botulisme', 'Brudd i neseben;lukket', 'Uspesifisert personlighetsforstyrrelse'])(page)

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
