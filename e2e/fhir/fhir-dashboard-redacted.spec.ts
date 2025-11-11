import { expect, test } from '@playwright/test'

import { requestAccessToSykmeldinger } from '../actions/user-actions'

import { launchWithMock } from './actions/fhir-actions'

test('redacted @feature-toggle should see other users sykmeldinger as redacted versions', async ({ page }) => {
    await launchWithMock('some-redacted-sykmeldinger', {
        SYK_INN_SHOW_REDACTED: true,
    })(page)

    await requestAccessToSykmeldinger()(page)

    await new Promise((resolve) => setTimeout(resolve, 5000))

    const table = page.getByRole('region', { name: 'Pågående sykmeldinger og utkast' })
    const rows = table.getByRole('row')

    await expect(table).toBeVisible()
    await expect(rows).toHaveCount(2) // 1 + header

    const tableHistoriske = page.getByRole('region', { name: 'Historiske sykmeldinger' })
    const rowsHistoriske = tableHistoriske.getByRole('row')

    await expect(tableHistoriske).toBeVisible()
    await expect(rowsHistoriske).toHaveCount(3) // 2 + header

    await expect(rows.nth(1).getByRole('cell').nth(1)).toHaveText('K24 - Eksempeldiagnose 1')
    await expect(rowsHistoriske.nth(1).getByRole('cell').nth(1)).toHaveText('Diagnose skjult')
    await expect(rowsHistoriske.nth(2).getByRole('cell').nth(1)).toHaveText('Diagnose skjult')
})

test('redacted @feature-toggle toggled off - should not display any other sykmeldinger', async ({ page }) => {
    await launchWithMock('some-redacted-sykmeldinger', {
        SYK_INN_SHOW_REDACTED: false,
    })(page)

    await requestAccessToSykmeldinger()(page)

    await new Promise((resolve) => setTimeout(resolve, 5000))

    const table = page.getByRole('region', { name: 'Pågående sykmeldinger og utkast' })
    const rows = table.getByRole('row')

    await expect(table).toBeVisible()
    await expect(rows).toHaveCount(2) // 1 + header

    const historiske = page.getByRole('region', { name: 'Historiske sykmeldinger' })
    await expect(historiske).toContainText('Pasienten har ingen historiske sykmeldinger')
    await expect(rows.nth(1).getByRole('cell').nth(1)).toHaveText('K24 - Eksempeldiagnose 1')
})
