import { test } from '@playwright/test'
import { OpprettSykmeldingDocument } from '@queries'

import { addUtdypendeSporsmal, fillPeriodeRelative, nextStep, submitSykmelding } from '../actions/user-actions'
import { expectGraphQLRequest } from '../utils/assertions'
import { today, inDays } from '../utils/date-utils'

import { launchWithMock } from './actions/fhir-actions'
import { startNewSykmelding } from './actions/fhir-user-actions'
import { verifySignerendeBehandler } from './actions/fhir-user-verifications'

test('Submit sykmelding with utdypende spørsmål when owning all sykmeldinger', async ({ page }) => {
    await launchWithMock('utfyllende-sporsmal')(page)
    await startNewSykmelding({ name: 'Espen Eksempel', fnr: '21037712323' })(page)

    await fillPeriodeRelative({
        type: '100%',
        days: 3,
    })(page)

    await addUtdypendeSporsmal({
        utfodringerMedArbeid: 'Utfordringer',
        medisinskOppsummering: 'Oppsummering',
    })(page)

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
                utfodringerMedArbeid: 'Utfordringer',
                medisinskOppsummering: 'Oppsummering',
                hensynPaArbeidsplassen: null,
            },
        },
    })
})

test('Submit sykmelding with utdypende spørsmål when sykmeldinger is redacted but SYK_INN_SHOW_REDACTED: true', async ({
    page,
}) => {
    await launchWithMock('utdypende-sporsmal-redacted', {
        SYK_INN_SHOW_REDACTED: true,
    })(page)
    await startNewSykmelding({ name: 'Espen Eksempel', fnr: '21037712323' })(page)

    await fillPeriodeRelative({
        type: '100%',
        days: 3,
    })(page)

    await addUtdypendeSporsmal({
        utfodringerMedArbeid: 'Utfordringer',
        medisinskOppsummering: 'Oppsummering',
    })(page)

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
                utfodringerMedArbeid: 'Utfordringer',
                medisinskOppsummering: 'Oppsummering',
                hensynPaArbeidsplassen: null,
            },
        },
    })
})

test('Submit sykmelding with utdypende spørsmål when sykmeldinger is redacted last one is owned by user', async ({
    page,
}) => {
    await launchWithMock('utdypende-sporsmal-redacted', {
        SYK_INN_SHOW_REDACTED: false,
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
            hoveddiagnose: { system: 'ICPC2', code: 'L73' },
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
                utfodringerMedArbeid: null,
                medisinskOppsummering: null,
                hensynPaArbeidsplassen: null,
            },
        },
    })
})
