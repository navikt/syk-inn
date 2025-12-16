import { expect, test } from '@playwright/test'

import { fillPeriodeRelative, nextStep } from '../actions/user-actions'

import { launchWithMock } from './actions/fhir-actions'
import { startNewSykmelding } from './actions/fhir-user-actions'

test('UGYLDIG_ORGNR_LENGDE', async ({ page }) => {
    await launchWithMock('normal', {
        patient: 'Espen Eksempel',
        practitioner: 'Magnar Koman',
        organization: 'Karlsrud',
    })(page)
    await startNewSykmelding()(page)
    await fillPeriodeRelative({
        type: '100%',
        days: 3,
    })(page)
    await nextStep()(page)

    const region = page.getByRole('region', { name: 'Signerende behandler' })

    await expect(region.getByText(/HPR(.*)9144889/), 'Correct HPR').toBeVisible()
    await expect(region.getByRole('region', { name: 'Advarsel' })).toContainText(
        new RegExp(/Organisasjonsnummeret vi fant på deg \(999\) ser ikke ut til å være et gyldig organisasjonsnummer/),
    )
})
