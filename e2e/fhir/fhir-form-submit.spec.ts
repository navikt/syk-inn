import { test, expect } from '@playwright/test'
import { OpprettSykmeldingDocument } from '@queries'

import { inDays, inputDate, today } from '../utils/date-utils'
import { fillPeriodeRelative, submitSykmelding, nextStep } from '../actions/user-actions'
import { expectGraphQLRequest } from '../utils/assertions'

import { launchWithMock } from './actions/fhir-actions'
import { startNewSykmelding } from './actions/fhir-user-actions'
import { verifySignerendeBehandler } from './actions/fhir-user-verifications'

test('submit with only default values and prefilled FHIR values', async ({ page }) => {
    await launchWithMock('empty')(page)
    await startNewSykmelding({ name: 'Espen Eksempel', fnr: '21037712323' })(page)

    await test.step('fill only values that are not prefilled (tom, grad)', async () => {
        // Tom is not prefilled
        await page.getByRole('textbox', { name: 'Til og med' }).fill(inputDate(inDays(3)))

        // Grad is not prefilled
        await page.getByRole('textbox', { name: 'Sykmeldingsgrad (%)' }).fill(`60`)
    })

    await nextStep()(page)
    await verifySignerendeBehandler()(page)

    const { request, draftId } = await submitSykmelding()(page)
    await expectGraphQLRequest(request).toBe(OpprettSykmeldingDocument, {
        draftId: draftId,
        meta: { orgnummer: null, legekontorTlf: null },
        force: false,
        values: {
            hoveddiagnose: { system: 'ICPC2', code: 'L73' },
            bidiagnoser: [],
            aktivitet: [
                {
                    type: 'GRADERT',
                    fom: today(),
                    tom: inDays(3),
                    gradert: {
                        grad: 60,
                        reisetilskudd: false,
                    },
                    aktivitetIkkeMulig: null,
                    avventende: null,
                    behandlingsdager: null,
                    reisetilskudd: null,
                },
            ],
            meldinger: { tilNav: null, tilArbeidsgiver: null },
            svangerskapsrelatert: false,
            yrkesskade: { yrkesskade: false, skadedato: null },
            arbeidsforhold: null,
            tilbakedatering: null,
            pasientenSkalSkjermes: false,
            utdypendeSporsmal: {
                utfordringerMedArbeid: null,
                medisinskOppsummering: null,
                hensynPaArbeidsplassen: null,
            },
        },
    })

    await expect(page.getByRole('heading', { name: 'Kvittering på innsendt sykmelding' })).toBeVisible()
})

test('should pre-fill bidiagnoser from FHIR @feature-toggle', async ({ page }) => {
    await launchWithMock('empty', {
        SYK_INN_AUTO_BIDIAGNOSER: true,
    })(page)
    await startNewSykmelding({ name: 'Espen Eksempel', fnr: '21037712323' })(page)

    await fillPeriodeRelative({
        type: '100%',
        days: 3,
    })(page)

    await nextStep()(page)
    await verifySignerendeBehandler()(page)

    const { request, draftId } = await submitSykmelding()(page)
    await expectGraphQLRequest(request).toBe(OpprettSykmeldingDocument, {
        draftId: draftId,
        meta: { orgnummer: null, legekontorTlf: null },
        force: false,
        values: {
            // Pre filled from FHIR
            hoveddiagnose: { code: 'L73', system: 'ICPC2' },
            // Pre filled from FHIR
            bidiagnoser: [
                { system: 'ICPC2', code: 'P74' },
                { system: 'ICD10', code: 'A051' },
            ],
            aktivitet: [
                {
                    type: 'AKTIVITET_IKKE_MULIG',
                    fom: today(),
                    tom: inDays(3),
                    aktivitetIkkeMulig: {
                        medisinskArsak: { isMedisinskArsak: true },
                        arbeidsrelatertArsak: {
                            isArbeidsrelatertArsak: false,
                            arbeidsrelaterteArsaker: [],
                            annenArbeidsrelatertArsak: null,
                        },
                    },
                    avventende: null,
                    gradert: null,
                    behandlingsdager: null,
                    reisetilskudd: null,
                },
            ],
            meldinger: { tilNav: null, tilArbeidsgiver: null },
            svangerskapsrelatert: false,
            yrkesskade: { yrkesskade: false, skadedato: null },
            arbeidsforhold: null,
            tilbakedatering: null,
            pasientenSkalSkjermes: false,
            utdypendeSporsmal: {
                utfordringerMedArbeid: null,
                medisinskOppsummering: null,
                hensynPaArbeidsplassen: null,
            },
        },
    })

    await expect(page.getByRole('heading', { name: 'Kvittering på innsendt sykmelding' })).toBeVisible()
})
