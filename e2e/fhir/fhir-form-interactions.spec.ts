import { expect, test } from '@playwright/test'
import { inDays, inputDate } from '@lib/test/date-utils'

import { requestAccessToSykmeldinger } from '../actions/user-actions'

import { launchWithMock } from './actions/fhir-actions'

/**
 * Refer to @see ../multi-mode/form-interactions.spec.ts for more generic
 * shorthand date interactions.
 */
test.describe("'shorthand' date interactions", () => {
    test('when using shorthand on a forlenget sykmelding, the shorhand should be from the start of the forlengelse', async ({
        page,
    }) => {
        await launchWithMock('one-current-to-tomorrow')(page)
        await requestAccessToSykmeldinger()(page)

        const table = page.getByRole('region', { name: 'Pågående sykmeldinger og utkast' })
        await table.getByRole('button', { name: 'Forlenge' }).click()

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
        await requestAccessToSykmeldinger()(page)

        const table = page.getByRole('region', { name: 'Pågående sykmeldinger og utkast' })
        await table.getByRole('button', { name: 'Forlenge' }).click()

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
})
