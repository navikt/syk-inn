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
 *  Avventende sykmelding rules (currently impossible, no avventende type):
 *  'AVVENTENDE_SYKMELDING_KOMBINERT',
 *  'MANGLENDE_INNSPILL_TIL_ARBEIDSGIVER',
 *  'AVVENTENDE_SYKMELDING_OVER_16_DAGER',
 *
 *  Misc (probably not relevant for pilot):
 *  'MANGLENDE_DYNAMISKE_SPOERSMAL_VERSJON2_UKE_39',
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

test('"Periode"-rules', async ({ page }) => {
    await launchWithMock('normal', { patient: 'Kari Normann' })(page)
    await startNewSykmelding()(page)

    /**
     * Not really possible to achieve, but this test verifies that the "Slett periode" button is not available,
     * and that the root useFieldArray error message (length based) is not visible.
     */
    await test.step('PERIODER_MANGLER', async () => {
        await page.getByRole('textbox', { name: 'Fra og med' }).clear()
        await page.getByRole('textbox', { name: 'Til og med' }).clear()

        await expect(page.getByRole('button', { name: 'Slett periode' })).not.toBeVisible()
        await nextStep()(page)
        await expect(page.getByText('Du må ha minst én periode')).not.toBeVisible()
    })

    await test.step('IKKE_DEFINERT_PERIODE (GRADERT)', async () => {
        await fillPeriodeRelative({ nth: 0, type: { grad: 50 }, fromRelative: 0, days: 6 })(page)

        const gradField = page.getByRole('textbox', { name: 'Sykmeldingsgrad (%)' })
        await gradField.clear()

        await nextStep()(page)
        await expect(gradField).toHaveAccessibleDescription('Du må fylle inn sykmeldingsgrad')
    })

    await test.step('IKKE_DEFINERT_PERIODE (100%)', async () => {
        await fillPeriodeRelative({ nth: 0, type: '100%', fromRelative: 0, days: 6 })(page)

        const gradField = page.getByRole('checkbox', { name: 'Medisinske årsaker forhindrer arbeidsaktivitet' })
        await gradField.uncheck()

        await nextStep()(page)
        await expect(gradField).toHaveAccessibleDescription('Du må velge minst én årsak')
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

    await test.step('OVERLAPPENDE_PERIODER', async () => {
        await fillPeriodeRelative({ nth: 0, type: '100%', fromRelative: 0, days: 6 })(page)
        await page.getByRole('button', { name: 'Legg til ny periode' }).click()
        const [fom] = await fillPeriodeRelative({ nth: 1, type: '100%', fromRelative: 6, days: 6 })(page)

        await nextStep()(page)
        await expect(fom).toHaveAccessibleDescription('Periode kan ikke overlappe med forrige periode')
    })

    await test.step('OPPHOLD_MELLOM_PERIODER', async () => {
        await fillPeriodeRelative({ nth: 0, type: '100%', fromRelative: 0, days: 6 })(page)
        await page.getByRole('button', { name: 'Legg til ny periode' }).click()
        const [fom] = await fillPeriodeRelative({ nth: 1, type: '100%', fromRelative: 8, days: 6 })(page)

        await nextStep()(page)
        await expect(fom).toHaveAccessibleDescription('Det kan ikke være opphold mellom perioder')
    })
})

/**
 * TODO: Currently unimplemented validation
 */
test.fail('"Time in relation to now"-rules', async () => {
    await test.step('FREMDATERT', async () => {
        // TODO: Currently unimplemented validation
        expect(true).toBeFalsy()
    })
    await test.step('TILBAKEDATERT_MER_ENN_3_AR', async () => {
        // TODO: Currently unimplemented validation
        expect(true).toBeFalsy()
    })
    await test.step('TOTAL_VARIGHET_OVER_ETT_AAR', async () => {
        // TODO: Currently unimplemented validation
        expect(true).toBeFalsy()
    })
})

/**
 * TODO: Currently unimplemented validation
 */
test.fail('UGYLDIG_KODEVERK_FOR_HOVEDDIAGNOSE, UGYLDIG_KODEVERK_FOR_BIDIAGNOSE', async () => {
    expect(true).toBeFalsy()
})
