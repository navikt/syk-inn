import { expect, test } from '@playwright/test'
import { OpprettSykmeldingDocument } from '@queries'

import {
    fillPeriodeRelative,
    nextStep,
    pickHoveddiagnose,
    selectAnnenLovpalagtFravarsgrunn,
    submitSykmelding,
} from '../actions/user-actions'
import { anything, expectGraphQLRequest } from '../utils/assertions'

import { expectedSykmeldingMeta, verifySignerendeBehandlerFillIfNeeded } from './actions/mode-user-verifications'
import { launchAndStart } from './actions/mode-user-actions'
import { modes } from './modes'

modes.forEach(({ mode }) => {
    test(`${mode}: Submit sykmelding with annen lovfestet fraværsgrunn`, async ({ page }) => {
        await launchAndStart(mode, 'normal')(page)

        await fillPeriodeRelative({ type: '100%', days: 3 })(page)
        await pickHoveddiagnose({ search: 'Angst', select: /Angstlidelse/ })(page)
        await selectAnnenLovpalagtFravarsgrunn({ reason: 'GODKJENT_HELSEINSTITUSJON' })(page)

        await nextStep()(page)
        await verifySignerendeBehandlerFillIfNeeded(mode)(page)

        const { request, draftId } = await submitSykmelding()(page)
        await expectGraphQLRequest(request).toBe(OpprettSykmeldingDocument, {
            draftId: draftId,
            meta: expectedSykmeldingMeta(mode),
            force: false,
            values: {
                annenFravarsgrunn: 'GODKJENT_HELSEINSTITUSJON',
                hoveddiagnose: anything(),
                bidiagnoser: [],
                aktivitet: anything(),
                meldinger: anything(),
                yrkesskade: anything(),
                utdypendeSporsmal: anything(),
                svangerskapsrelatert: false,
                pasientenSkalSkjermes: false,
                arbeidsforhold: null,
                tilbakedatering: null,
            },
        })
    })

    test(`${mode}: When ticking the checkbox the reason should be required`, async ({ page }) => {
        await launchAndStart(mode, 'normal')(page)

        await fillPeriodeRelative({ type: '100%', days: 3 })(page)
        await pickHoveddiagnose({ search: 'Angst', select: /Angstlidelse/ })(page)
        await page.getByRole('checkbox', { name: 'Sykmeldingen har en annen lovfestet fraværsgrunn' }).click()

        await nextStep()(page)

        await expect(page.getByRole('combobox', { name: 'Velg lovfestet fraværsgrunn' })).toHaveAccessibleDescription(
            'Du må velge en lovfestet fraværsgrunn',
        )
    })
})
