import { expect, test } from '@playwright/test'

import {
    addBidiagnose,
    deleteBidiagnose,
    editBidiagnose,
    pickHoveddiagnose,
    editHoveddiagnose,
} from '../actions/user-actions'
import { expectBidagnoses, expectHoveddiagnose } from '../actions/user-form-verification'
import { inDays, inputDate } from '../utils/date-utils'

import { modes, onMode } from './modes'
import { launchAndStart } from './actions/mode-user-actions'

modes.forEach(({ mode }) => {
    test(`${mode}: hoveddiagnose - shall be able to edit diagnose`, async ({ page }) => {
        await launchAndStart(mode, 'empty')(page)

        await onMode(mode, {
            fhir: async (page) => {
                // Prefilled
                await expectHoveddiagnose(/L73 - Brudd legg\/ankel/)(page)
            },
            standalone: async () => void 0,
        })(page)

        await pickHoveddiagnose({ search: 'Angst', select: /Angstlidelse/ })(page)
        await editHoveddiagnose({ search: 'H75', select: /H75/ })(page)
        await expectHoveddiagnose(/Svulst øre/)(page)
    })

    test(`${mode}: bidiagnoser - adding, editing, deleting adhd test`, async ({ page }) => {
        await launchAndStart(mode, 'empty')(page)

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

    test.describe(`${mode}: 'shorthand' date interactions`, () => {
        test(`${mode}: when using shorthand on n+1 period, the shorhand should be from the tom+1 of the previous period`, async ({
            page,
        }) => {
            await launchAndStart(mode, 'empty')(page)

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

        test(`${mode}: when using shorthand on n+1 period, should handle tom shorthands`, async ({ page }) => {
            await launchAndStart(mode, 'empty')(page)

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

        test(`${mode}: misc interactions through fom-field`, async ({ page }) => {
            await launchAndStart(mode, 'empty')(page)

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

        test(`${mode}: misc interactions through tom-field`, async ({ page }) => {
            await launchAndStart(mode, 'empty')(page)

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

        test(`${mode}: should display popover with hint for fom field`, async ({ page }) => {
            await launchAndStart(mode, 'empty')(page)

            const periodeRegion = page.getByRole('region', { name: 'Periode' })
            const fom = periodeRegion.getByRole('textbox', { name: 'Fra og med' })

            await fom.fill('7d')

            const popover = periodeRegion.getByRole('region', { name: 'Trykk Enter for å bruke følgende datoer' })
            await expect(popover).toBeVisible()
            await expect(popover).toHaveText(/Fra .* \d{1,2}\. .* til .* \d{1,2}\. .*/)
        })

        test(`${mode}: should display popover with hint for tom field`, async ({ page }) => {
            await launchAndStart(mode, 'empty')(page)

            const periodeRegion = page.getByRole('region', { name: 'Periode' })
            const tom = periodeRegion.getByRole('textbox', { name: 'Til og med' })

            await tom.fill('7d')

            const popover = periodeRegion.getByRole('region', { name: 'Trykk Enter for å bruke følgende datoer' })
            await expect(popover).toBeVisible()
            await expect(popover).toHaveText(/Fra .* \d{1,2}\. .* til .* \d{1,2}\. .*/)
        })
    })
})
