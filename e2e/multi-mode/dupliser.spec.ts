import { expect, test } from '@playwright/test'

import {
    addBidiagnose,
    fillPeriodeRelative,
    nextStep,
    pickHoveddiagnose,
    submitSykmelding,
} from '../actions/user-actions'
import { verifySummaryPage } from '../actions/user-verifications'
import { expectBidagnoses, expectHoveddiagnose, expectPeriode } from '../actions/user-form-verification'
import { userInteractionsGroup } from '../utils/actions'
import * as fhirActions from '../fhir/actions/fhir-user-actions'
import * as fhirUserVerification from '../fhir/actions/fhir-user-verifications'
import * as standaloneActions from '../standalone/actions/standalone-user-actions'
import * as standaloneUserVerification from '../standalone/actions/standalone-user-verifications'

import { launchMode, modes, onMode } from './modes'

modes.forEach(({ mode }) => {
    test(`${mode}: should be able to duplicate from kvittering`, async ({ page }) => {
        await launchMode(
            mode,
            {
                onFhir: fhirActions.startNewSykmelding({ name: 'Espen Eksempel', fnr: '21037712323' }),
                onStandalone: userInteractionsGroup(
                    standaloneActions.searchPerson('21037712323'),
                    standaloneActions.startNewSykmelding('21037712323'),
                ),
            },
            'normal',
            { PILOT_USER: true },
        )(page)

        await fillPeriodeRelative({
            type: '100%',
            days: 3,
        })(page)

        await pickHoveddiagnose({ search: 'Angst', select: /Angstlidelse/ })(page)
        await addBidiagnose({ search: 'P17', select: /Tobakkmisbruk/ })(page)

        await nextStep()(page)
        await onMode(mode, {
            fhir: async (page) => {
                await fhirUserVerification.verifySignerendeBehandler()(page)
            },
            standalone: async (page) => {
                await standaloneUserVerification.verifySignerendeBehandler('123456')(page)
                await standaloneActions.fillOrgnummer('112233445')(page)
                await standaloneActions.fillTelefonnummer('+47 99887766')(page)
            },
        })(page)
        await verifySummaryPage([
            {
                name: 'Periode',
                values: [/100% sykmelding/],
            },
        ])(page)

        await submitSykmelding()(page)

        await expect(page.getByRole('heading', { name: 'Kvittering på innsendt sykmelding' })).toBeVisible()

        await page.getByRole('button', { name: 'Dupliser' }).click()

        await test.step('Verify form values', async () => {
            await expectPeriode({ type: '100%', days: 3, fromRelative: 0 })(page)
            await expectHoveddiagnose('P74 - Angstlidelse')(page)
            await expectBidagnoses(['P17 - Tobakkmisbruk'])(page)
        })
    })
})
