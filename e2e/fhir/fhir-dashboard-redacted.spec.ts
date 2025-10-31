import { expect, test } from '@playwright/test'

import { launchWithMock } from './actions/fhir-actions'

test('redacted @feature-toggle should see other users sykmeldinger as redacted versions', async ({ page }) => {
    await launchWithMock('some-redacted-sykmeldinger', {
        SYK_INN_SHOW_REDACTED: true,
    })(page)

    await new Promise((resolve) => setTimeout(resolve, 5000))

    const table = page.getByRole('region', { name: 'Tidligere sykmeldinger og utkast' })
    const rows = table.getByRole('row')

    await expect(table).toBeVisible()
    await expect(rows).toHaveCount(4) // 3 + header

    await expect(rows.nth(1).getByRole('cell').nth(1)).toHaveText('K24 - Eksempeldiagnose 1')
    await expect(rows.nth(2).getByRole('cell').nth(1)).toHaveText('Diagnose skjult')
    await expect(rows.nth(3).getByRole('cell').nth(1)).toHaveText('Diagnose skjult')
})

test('redacted @feature-toggle toggled off - should not display any other sykmeldinger', async ({ page }) => {
    await launchWithMock('some-redacted-sykmeldinger', {
        SYK_INN_SHOW_REDACTED: false,
    })(page)

    await new Promise((resolve) => setTimeout(resolve, 5000))

    const table = page.getByRole('region', { name: 'Tidligere sykmeldinger og utkast' })
    const rows = table.getByRole('row')

    await expect(table).toBeVisible()
    await expect(rows).toHaveCount(2) // 1 + header

    await expect(rows.nth(1).getByRole('cell').nth(1)).toHaveText('K24 - Eksempeldiagnose 1')
})
