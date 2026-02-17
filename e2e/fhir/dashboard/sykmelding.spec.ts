import { expect, test } from '@playwright/test'
import { toReadableDatePeriod } from '@lib/date'
import { add } from 'date-fns'
import { sykmeldingPeriodeText } from '@features/fhir/dashboard/combo-table/sykmelding/sykmelding-utils'

import { launchWithMock } from '../actions/fhir-actions'
import { gotoExistingSykmelding } from '../actions/fhir-user-actions'
import {
    fillPeriodeRelative,
    nextStep,
    pickHoveddiagnose,
    requestAccessToSykmeldinger,
    submitSykmelding,
} from '../../actions/user-actions'
import { verifyNoHorizontalScroll } from '../../utils/assertions'
import { launchAndStart } from '../../multi-mode/actions/mode-user-actions'
import { diagnoseSelection } from '../../utils/submit-utils'
import { verifySignerendeBehandlerFillIfNeeded } from '../../multi-mode/actions/mode-user-verifications'

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

test('sykmelding with multiple periods should show full period in link and all other periods in helptext', async ({
    page,
}) => {
    await launchAndStart('FHIR', 'normal')(page)

    await fillPeriodeRelative({ type: '100%', days: 6, nth: 0 })(page)
    await page.getByRole('button', { name: 'Legg til ny periode' }).click()
    await fillPeriodeRelative({ type: { grad: 50 }, days: 6, fromRelative: 7, nth: 1 })(page)
    await page.getByRole('button', { name: 'Legg til ny periode' }).click()
    await fillPeriodeRelative({ type: { grad: 30 }, days: 6, fromRelative: 14, nth: 2 })(page)

    await pickHoveddiagnose(diagnoseSelection.angst.pick)(page)

    await nextStep()(page)
    await verifySignerendeBehandlerFillIfNeeded('FHIR')(page)

    await submitSykmelding()(page)

    //await nextStep()(page)
    await page.getByRole('button', { name: 'Tilbake til pasientoversikt' }).click()

    const dateText = toReadableDatePeriod(new Date(), add(new Date(), { days: 20 }))

    const tableRow = page.getByRole('cell', { name: dateText })

    await expect(tableRow.getByRole('link', { name: dateText })).toBeVisible()

    await tableRow.getByRole('button', { name: 'Se alle perioder for sykmelding' }).click()

    const periodeText = sykmeldingPeriodeText([
        { fom: new Date().toISOString(), tom: add(new Date(), { days: 6 }).toISOString() },
    ])

    await expect(tableRow.getByText(`${periodeText} (100%)`)).toBeVisible()
})
