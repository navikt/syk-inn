import { expect, test } from '@playwright/test'

import { fillPeriodeRelative, nextStep } from '../actions/user-actions'

import { launchWithMock } from './actions/fhir-actions'
import { startNewSykmelding } from './actions/fhir-user-actions'

/**
 * TODO: Currently unimplemented validation
 */
test.fail('UGYLDIG_ORGNR_LENGDE', async ({ page }) => {
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

    // TODO: Incomplete test
    await expect(page.getByText(/Organisasjonsnummeret må være minst 11 siffer/)).toBeVisible()
})
