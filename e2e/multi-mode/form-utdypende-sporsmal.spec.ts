import { test } from '@playwright/test'
import { OpprettSykmeldingDocument } from '@queries'
import { today, inDays } from '@lib/test/date-utils'
import { questionTexts } from '@core/data-layer/common/questions'

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
                    arbeidsrelaterteUtfordringer: null,
                    behandlingOgFremtidigArbeid: null,
                    forventetHelsetilstandUtvikling: null,
                    medisinskeHensyn: null,
                    oppdatertMedisinskStatus: null,
                    realistiskMestringArbeid: null,
                    sykdomsutvikling: null,
                    uavklarteForhold: null,
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
                    arbeidsrelaterteUtfordringer: null,
                    behandlingOgFremtidigArbeid: null,
                    forventetHelsetilstandUtvikling: null,
                    medisinskeHensyn: null,
                    oppdatertMedisinskStatus: null,
                    realistiskMestringArbeid: null,
                    sykdomsutvikling: null,
                    uavklarteForhold: null,
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

    test(`${mode}: Trigger all utdypende spørsmål in one 100% sykmelding`, async ({ page }) => {
        await launchAndStart(mode, 'empty')(page)

        await fillPeriodeRelative({ type: '100%', days: 280 })(page)
        await pickHoveddiagnose(diagnoseSelection.angst.pick)(page)
        await addUtdypendeSporsmal({
            uke: '40',
            realistiskMestringArbeid: 'Utfordringer',
            oppdatertMedisinskStatus: 'Sykdomsutvikling',
            hensynPaArbeidsplassen: 'Hensyn på arbeidsplassen',
            behandlingOgFremtidigArbeid: 'Behandling og fremtidig arbeid',
            uavklarteForhold: 'Uavklarte forhold',
            forventetHelsetilstandUtvikling: 'bedring',
            medisinskeHensyn: 'Medisinske hensyn',
        })(page)

        await nextStep()(page)
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
                        tom: inDays(280),
                    }),
                ],
                utdypendeSporsmal: {
                    utfordringerMedArbeid: null,
                    medisinskOppsummering: null,
                    hensynPaArbeidsplassen: 'Hensyn på arbeidsplassen',
                    arbeidsrelaterteUtfordringer: null,
                    sykdomsutvikling: null,
                    behandlingOgFremtidigArbeid: 'Behandling og fremtidig arbeid',
                    uavklarteForhold: 'Uavklarte forhold',
                    oppdatertMedisinskStatus: 'Sykdomsutvikling',
                    realistiskMestringArbeid: 'Utfordringer',
                    forventetHelsetilstandUtvikling:
                        questionTexts.utdypendeSporsmal.forventetHelsetilstandUtvikling.answerOptions.forventetBedring,
                    medisinskeHensyn: 'Medisinske hensyn',
                },
            },
        })
    })

    test(`${mode}: Trigger week 17 when week 7 has already been answered`, async ({ page }) => {
        await launchAndStart(mode, 'utdypende-sporsmal-answered-7-weeks')(page)

        await fillPeriodeRelative({ type: '100%', days: 100 })(page)
        await pickHoveddiagnose(diagnoseSelection.angst.pick)(page)
        await addUtdypendeSporsmal({
            uke: '18',
            arbeidsrelaterteUtfordringer: 'Utfordringer',
            sykdomsutvikling: 'Sykdomsutvikling',
            behandlingOgFremtidigArbeid: 'Behandling og fremtidig arbeid',
            uavklarteForhold: 'Uavklarte forhold',
        })(page)

        await nextStep()(page)
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
                        tom: inDays(100),
                    }),
                ],
                utdypendeSporsmal: {
                    utfordringerMedArbeid: null,
                    medisinskOppsummering: null,
                    hensynPaArbeidsplassen: null,
                    arbeidsrelaterteUtfordringer: 'Utfordringer',
                    sykdomsutvikling: 'Sykdomsutvikling',
                    behandlingOgFremtidigArbeid: 'Behandling og fremtidig arbeid',
                    uavklarteForhold: 'Uavklarte forhold',
                    oppdatertMedisinskStatus: null,
                    realistiskMestringArbeid: null,
                    forventetHelsetilstandUtvikling: null,
                    medisinskeHensyn: null,
                },
            },
        })
    })
})
