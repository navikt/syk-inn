import { OpprettSykmeldingDocument } from '@core/data-layer/graphql/generated/queries.generated'
import { inDays, daysAgo } from '@lib/test/date-utils'
import test from '@playwright/test'
import { toReadableDatePeriod, toReadableDate } from '@lib/date'

import {
    fillPeriodeRelative,
    pickHoveddiagnose,
    nextStep,
    submitSykmelding,
    fillTilbakedatering,
} from '../actions/user-actions'
import { verifyIsOnKvitteringPage } from '../fhir/actions/fhir-user-verifications'
import { anything, expectGraphQLRequest } from '../utils/assertions'
import { defaultAktivitetIkkeMulig, defaultOpprettSykmeldingValues, diagnoseSelection } from '../utils/submit-utils'
import { verifySummaryPage } from '../actions/user-verifications'

import { launchAndStart } from './actions/mode-user-actions'
import { verifySignerendeBehandlerFillIfNeeded, expectedSykmeldingMeta } from './actions/mode-user-verifications'
import { modes, onMode } from './modes'

modes.forEach(({ mode }) => {
    test(`${mode}: 'tilbakedatering' should be removed from state when period is updated to not be a 'tilbakedatering' period`, async ({
        page,
    }) => {
        await launchAndStart(mode)(page)
        await fillPeriodeRelative({ type: '100%', days: 3, fromRelative: -5 })(page)
        await fillTilbakedatering({
            contact: daysAgo(5),
            reason: 'VENTETID_LEGETIME',
        })(page)
        await fillPeriodeRelative({ type: '100%', days: 3, fromRelative: -3 })(page)

        await onMode(mode, {
            fhir: async () => void 0,
            standalone: async (page) => {
                await pickHoveddiagnose(diagnoseSelection.angst.pick)(page)
            },
        })(page)

        await nextStep()(page)
        await verifySignerendeBehandlerFillIfNeeded(mode)(page)

        const { request, draftId } = await submitSykmelding()(page)
        await expectGraphQLRequest(request).toBe(OpprettSykmeldingDocument, {
            draftId: draftId,
            meta: expectedSykmeldingMeta(mode),
            force: false,
            values: {
                ...defaultOpprettSykmeldingValues,
                tilbakedatering: null,
                aktivitet: anything(),
            },
        })

        await verifyIsOnKvitteringPage()(page)
    })

    test(`${mode}: 'tilbakedatering' is asked and required when fom is 5 days in the past`, async ({ page }) => {
        await launchAndStart(mode)(page)

        await fillPeriodeRelative({ type: '100%', fromRelative: -5, days: 5 })(page)
        await fillTilbakedatering({
            contact: daysAgo(2),
            reason: 'Ventetid på legetime',
        })(page)
        await pickHoveddiagnose(diagnoseSelection.angst.pick)(page)

        await nextStep()(page)
        await verifySignerendeBehandlerFillIfNeeded(mode)(page)

        await verifySummaryPage([
            mode === 'FHIR'
                ? {
                      name: 'Sykmeldingen gjelder',
                      values: ['Espen Eksempel', '21037712323'],
                  }
                : {
                      name: 'Sykmeldingen gjelder',
                      values: ['Ola Nordmann Hansen', '21037712323'],
                  },
            {
                name: 'Har pasienten flere arbeidsgivere?',
                values: ['Nei'],
            },
            {
                name: 'Periode',
                values: [new RegExp(toReadableDatePeriod(daysAgo(5), inDays(0)))],
            },
            {
                name: 'Periode',
                values: [/100% sykmelding/],
            },
            {
                name: 'Hoveddiagnose',
                values: ['Angstlidelse (P74)ICPC2'], // TODO: Hvorfor kommer denne som en linje?
            },
            {
                name: 'Dato for tilbakedatering',
                values: [toReadableDate(daysAgo(2))],
            },
            {
                name: 'Grunn for tilbakedatering',
                values: ['Ventetid på legetime'],
            },
        ])(page)

        const { request, draftId } = await submitSykmelding()(page)

        await expectGraphQLRequest(request).toBe(OpprettSykmeldingDocument, {
            draftId: draftId,
            meta: expectedSykmeldingMeta(mode),
            force: false,
            values: {
                ...defaultOpprettSykmeldingValues,
                hoveddiagnose: diagnoseSelection.angst.verify,
                aktivitet: [
                    defaultAktivitetIkkeMulig({
                        fom: daysAgo(5),
                        tom: inDays(0),
                    }),
                ],
                tilbakedatering: {
                    startdato: daysAgo(2),
                    begrunnelse: 'Ventetid på legetime',
                },
            },
        })
    })

    test(`${mode}: "tilbakedatering" and "Annen årsak" input field is required and part of payload when checked`, async ({
        page,
    }) => {
        await launchAndStart(mode)(page)

        await fillPeriodeRelative({ type: '100%', fromRelative: -5, days: 5 })(page)
        await fillTilbakedatering({
            contact: daysAgo(2),
            reason: 'Annet',
            otherReason: 'Annen årsak til tilbakedatering',
        })(page)
        await pickHoveddiagnose(diagnoseSelection.angst.pick)(page)

        await nextStep()(page)
        await verifySignerendeBehandlerFillIfNeeded(mode)(page)

        const { request, draftId } = await submitSykmelding()(page)

        await expectGraphQLRequest(request).toBe(OpprettSykmeldingDocument, {
            draftId: draftId,
            meta: expectedSykmeldingMeta(mode),
            force: false,
            values: {
                ...defaultOpprettSykmeldingValues,
                hoveddiagnose: diagnoseSelection.angst.verify,
                aktivitet: [
                    defaultAktivitetIkkeMulig({
                        fom: daysAgo(5),
                        tom: inDays(0),
                    }),
                ],
                tilbakedatering: {
                    startdato: daysAgo(2),
                    begrunnelse: 'Annen årsak til tilbakedatering',
                },
            },
        })
    })
})
