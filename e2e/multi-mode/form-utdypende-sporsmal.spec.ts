import { test } from '@playwright/test'
import { OpprettSykmeldingDocument } from '@queries'

import {
    addUtdypendeSporsmal,
    fillPeriodeRelative,
    nextStep,
    pickHoveddiagnose,
    submitSykmelding,
} from '../actions/user-actions'
import { expectGraphQLRequest } from '../utils/assertions'
import { today, inDays } from '../utils/date-utils'

import { expectedSykmeldingMeta, verifySignerendeBehandlerFillIfNeeded } from './actions/mode-user-verifications'
import { launchAndStart } from './actions/mode-user-actions'
import { modes } from './modes'

modes.forEach(({ mode }) => {
    test(`${mode}: Submit sykmelding with utdypende spørsmål when owning all sykmeldinger`, async ({ page }) => {
        await launchAndStart(mode, 'utfyllende-sporsmal')(page)

        await fillPeriodeRelative({
            type: '100%',
            days: 3,
        })(page)

        await pickHoveddiagnose({ search: 'Angst', select: /Angstlidelse/ })(page)

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
                hoveddiagnose: { system: 'ICPC2', code: 'P74' },
                bidiagnoser: [],
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

        await fillPeriodeRelative({
            type: '100%',
            days: 3,
        })(page)

        await pickHoveddiagnose({ search: 'Angst', select: /Angstlidelse/ })(page)

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
                hoveddiagnose: { system: 'ICPC2', code: 'P74' },
                bidiagnoser: [],
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

        await fillPeriodeRelative({
            type: '100%',
            days: 3,
        })(page)

        await pickHoveddiagnose({ search: 'Angst', select: /Angstlidelse/ })(page)

        await nextStep()(page)
        await verifySignerendeBehandlerFillIfNeeded(mode)(page)

        const { request, draftId } = await submitSykmelding()(page)
        await expectGraphQLRequest(request).toBe(OpprettSykmeldingDocument, {
            draftId: draftId,
            meta: expectedSykmeldingMeta(mode),
            force: false,
            values: {
                hoveddiagnose: { system: 'ICPC2', code: 'P74' },
                bidiagnoser: [],
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
    })
})
