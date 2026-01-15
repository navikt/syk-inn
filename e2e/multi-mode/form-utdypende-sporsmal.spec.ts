import { test } from '@playwright/test'
import { OpprettSykmeldingDocument } from '@queries'
import { today, inDays } from '@lib/test/date-utils'

import {
    addUtdypendeSporsmal,
    fillPeriodeRelative,
    nextStep,
    pickHoveddiagnose,
    submitSykmelding,
} from '../actions/user-actions'
import { expectGraphQLRequest } from '../utils/assertions'
import { defaultAktivitetIkkeMulig, defaultOpprettSykmeldingValues, diagnoseSelection } from '../utils/submit-utils'

import { expectedSykmeldingMeta, verifySignerendeBehandlerFillIfNeeded } from './actions/mode-user-verifications'
import { launchAndStart } from './actions/mode-user-actions'
import { modes } from './modes'

modes.forEach(({ mode }) => {
    test(`${mode}: Submit sykmelding with utdypende spørsmål when owning all sykmeldinger`, async ({ page }) => {
        await launchAndStart(mode, 'utfyllende-sporsmal')(page)

        await fillPeriodeRelative({ type: '100%', days: 3 })(page)
        await pickHoveddiagnose(diagnoseSelection.angst.pick)(page)
        await addUtdypendeSporsmal({
            utfordringerMedArbeid: 'Utfordringer',
            medisinskOppsummering: 'Oppsummering',
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
                hoveddiagnose: diagnoseSelection.angst.verify,
                aktivitet: [
                    defaultAktivitetIkkeMulig({
                        fom: today(),
                        tom: inDays(3),
                    }),
                ],
                utdypendeSporsmal: {
                    utfordringerMedArbeid: 'Utfordringer',
                    medisinskOppsummering: 'Oppsummering',
                    hensynPaArbeidsplassen: null,
                },
            },
        })
    })

    test(`${mode}: Submit sykmelding with utdypende spørsmål when sykmeldinger is redacted but SYK_INN_SHOW_REDACTED: true`, async ({
        page,
    }) => {
        await launchAndStart(mode, 'utdypende-sporsmal-redacted', {
            SYK_INN_SHOW_REDACTED: true,
        })(page)

        await fillPeriodeRelative({ type: '100%', days: 3 })(page)
        await pickHoveddiagnose(diagnoseSelection.angst.pick)(page)
        await addUtdypendeSporsmal({
            utfordringerMedArbeid: 'Utfordringer',
            medisinskOppsummering: 'Oppsummering',
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
                hoveddiagnose: diagnoseSelection.angst.verify,
                aktivitet: [
                    defaultAktivitetIkkeMulig({
                        fom: today(),
                        tom: inDays(3),
                    }),
                ],
                utdypendeSporsmal: {
                    utfordringerMedArbeid: 'Utfordringer',
                    medisinskOppsummering: 'Oppsummering',
                    hensynPaArbeidsplassen: null,
                },
            },
        })
    })

    test(`${mode}: Submit sykmelding with utdypende spørsmål when sykmeldinger is redacted last one is owned by user`, async ({
        page,
    }) => {
        await launchAndStart(mode, 'utdypende-sporsmal-redacted', {
            SYK_INN_SHOW_REDACTED: false,
        })(page)

        await fillPeriodeRelative({ type: '100%', days: 3 })(page)
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
                        fom: today(),
                        tom: inDays(3),
                    }),
                ],
            },
        })
    })
})
