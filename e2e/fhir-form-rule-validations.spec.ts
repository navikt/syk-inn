import { expect, test } from '@playwright/test'

import { launchWithMock } from './actions/fhir-actions'
import { fillPeriodeRelative, nextStep, startNewSykmelding } from './actions/user-actions'

test('UGYLDIG_ORGNR_LENGDE', async ({ page }) => {
    await launchWithMock('normal', {
        patient: 'Espen Eksempel',
        practitioner: 'Magnar Koman',
        organization: 'Manglerud',
    })(page)
    await startNewSykmelding()(page)
    await fillPeriodeRelative({
        type: '100%',
        days: 3,
    })(page)
    await nextStep()(page)

    // TODO: Incomplete test
    await expect(page.getByRole('heading', { name: 'Kunne ikke hente signerende behandler' })).toBeVisible()
})
