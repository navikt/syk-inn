import { expect, test } from '@playwright/test'

import { launchWithMock } from '../actions/fhir-actions'
import { gotoExistingSykmelding } from '../actions/fhir-user-actions'
import { requestAccessToSykmeldinger } from '../../actions/user-actions'
import { verifyNoHorizontalScroll } from '../../utils/assertions'

test('should be able to view previous sykmelding', async ({ page }) => {
    await launchWithMock('plenty-of-previous')(page)

    await gotoExistingSykmelding('current', 1)(page)

    // Should have non light/redacted sykmelding:
    const valuesSection = page.getByRole('region', { name: 'Innsendt sykmelding' })
    await expect(valuesSection).toBeVisible()
    await expect(valuesSection.getByText('Hoveddiagnose')).toBeVisible()
    await expect(valuesSection.getByText('Har pasienten flere arbeidsforhold?')).toBeVisible()

    // Should show signerende behandler
    const behandlerSection = page.getByRole('region', { name: 'Signerende Behandler' })
    await expect(behandlerSection).toBeVisible()
    await expect(behandlerSection.getByText('Signerende behandler')).toBeVisible()
    await expect(behandlerSection.getByText('HPR')).toBeVisible()
    await expect(behandlerSection.getByText('Organisasjonsnummer')).toBeVisible()

    await verifyNoHorizontalScroll()(page)
})

test('previous sykmelding within 4 days should still show as a full sykmelding', async ({ page }) => {
    await launchWithMock('plenty-of-previous')(page)

    await gotoExistingSykmelding('current', 4)(page)

    // Should have non light/redacted sykmelding:
    const valuesSection = page.getByRole('region', { name: 'Innsendt sykmelding' })
    await expect(valuesSection).toBeVisible()
    await expect(valuesSection.getByText('Hoveddiagnose')).toBeVisible()
    await expect(valuesSection.getByText('Har pasienten flere arbeidsforhold?')).toBeVisible()

    // Should show signerende behandler
    const behandlerSection = page.getByRole('region', { name: 'Signerende Behandler' })
    await expect(behandlerSection).toBeVisible()
    await expect(behandlerSection.getByText('Signerende behandler')).toBeVisible()
    await expect(behandlerSection.getByText('HPR')).toBeVisible()
    await expect(behandlerSection.getByText('Organisasjonsnummer')).toBeVisible()

    await verifyNoHorizontalScroll()(page)
})

test('previous sykmelding older than 4 days should display less values', async ({ page }) => {
    await launchWithMock('plenty-of-previous')(page)

    await requestAccessToSykmeldinger()(page)

    await gotoExistingSykmelding('previous', 1)(page)

    // Should have non light/redacted sykmelding:
    const valuesSection = page.getByRole('region', { name: 'Innsendt sykmelding' })
    await expect(valuesSection).toBeVisible()
    await expect(valuesSection.getByText('Hoveddiagnose')).toBeVisible()
    await expect(valuesSection.getByRole('heading', { name: /Denne sykmeldingen er eldre enn 4 dager/ })).toBeVisible()
    await expect(valuesSection.getByText('Har pasienten flere arbeidsforhold?')).not.toBeVisible()

    // Should show signerende behandler
    const behandlerSection = page.getByRole('region', { name: 'Signerende Behandler' })
    await expect(behandlerSection).toBeVisible()
    await expect(behandlerSection.getByText('Signerende behandler')).toBeVisible()
    await expect(behandlerSection.getByText('HPR')).toBeVisible()
    await expect(behandlerSection.getByText('Organisasjonsnummer')).toBeVisible()

    await verifyNoHorizontalScroll()(page)
})
