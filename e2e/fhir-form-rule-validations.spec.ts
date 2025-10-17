import { expect, test } from '@playwright/test'

import { launchWithMock } from './actions/fhir-actions'
import { fillPeriodeRelative, nextStep, startNewSykmelding } from './actions/user-actions'

/**
 * The following rules should never actually hit the backend "hard stop", and should
 * always be validated before submission:
 *
 * Based on FHIR data:
 *  'UGYLDIG_ORGNR_LENGDE',
 *
 * Periode form validation:
 *  'PERIODER_MANGLER',
 *  'FRADATO_ETTER_TILDATO',
 *  'OVERLAPPENDE_PERIODER',
 *  'OPPHOLD_MELLOM_PERIODER',
 *  'IKKE_DEFINERT_PERIODE',
 *
 * Sykmelding-variations:
 *  'GRADERT_SYKMELDING_OVER_99_PROSENT',
 *  'GRADERT_SYKMELDING_0_PROSENT',
 *  'FRAVAERSGRUNN_MANGLER',
 *
 *  Diagnosis code validations:
 *  'UGYLDIG_KODEVERK_FOR_HOVEDDIAGNOSE',
 *  'UGYLDIG_KODEVERK_FOR_BIDIAGNOSE',
 *
 *  Time relative to now validations:
 *  'FREMDATERT',
 *  'TILBAKEDATERT_MER_ENN_3_AR',
 *  'TOTAL_VARIGHET_OVER_ETT_AAR',
 *
 *  Misc:
 *  'MANGLENDE_DYNAMISKE_SPOERSMAL_VERSJON2_UKE_39',
 *  'AVVENTENDE_SYKMELDING_KOMBINERT',
 *  'MANGLENDE_INNSPILL_TIL_ARBEIDSGIVER',
 *  'AVVENTENDE_SYKMELDING_OVER_16_DAGER',
 *  'FOR_MANGE_BEHANDLINGSDAGER_PER_UKE',
 *  'OVER_1_MND_SPESIALISTHELSETJENESTEN',
 */

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

test('Perioderegler', async ({ page }) => {
    await launchWithMock('normal', { patient: 'Kari Normann' })(page)
    await startNewSykmelding()(page)

    /**
     * Not really possible to achieve, but this test verifies that the "Slett periode" button is not available,
     * and that the root useFieldArray is not visible.
     */
    await test.step('PERIODER_MANGLER', async () => {
        await page.getByRole('textbox', { name: 'Fra og med' }).clear()
        await page.getByRole('textbox', { name: 'Til og med' }).clear()

        await expect(page.getByRole('button', { name: 'Slett periode' })).not.toBeVisible()
        await nextStep()(page)
        await expect(page.getByText('Du må ha minst én periode')).not.toBeVisible()
    })

    await test.step('FRADATO_ETTER_TILDATO', async () => {
        await fillPeriodeRelative({
            type: '100%',
            days: -6,
            fromRelative: 0,
        })(page)

        await nextStep()(page)

        await expect(page.getByText('Fra og med dato kan ikke være etter til og med dato')).toBeVisible()
    })

    await test.step('OVERLAPPENDE_PERIODER', async () => {})
    await test.step('OPPHOLD_MELLOM_PERIODER', async () => {})
    await test.step('IKKE_DEFINERT_PERIODE', async () => {})
})
