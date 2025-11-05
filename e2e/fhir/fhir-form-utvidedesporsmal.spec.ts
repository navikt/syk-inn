import { test } from '@playwright/test'

import { OpprettSykmeldingDocument } from '@queries'

import {
    addUtdypendeSporsmal,
    fillPeriodeRelative,
    nextStep,
    pickHoveddiagnose,
    requestAccessToSykmeldinger,
    submitSykmelding,
} from '../actions/user-actions'
import { userInteractionsGroup } from '../utils/actions'
import { expectGraphQLRequest } from '../utils/assertions'
import { today, inDays } from '../utils/date-utils'

import { launchWithMock } from './actions/fhir-actions'
import { startNewSykmelding } from './actions/fhir-user-actions'
import { verifySignerendeBehandler } from './actions/fhir-user-verifications'

const launchAndStart = userInteractionsGroup(
    launchWithMock('utfyllende-sporsmal'),
    requestAccessToSykmeldinger(),
    startNewSykmelding({ name: 'Espen Eksempel', fnr: '21037712323' }),
)

test('Submit sykmelding with utdypende spørsmål', async ({ page }) => {
    await launchAndStart(page)

    await fillPeriodeRelative({
        type: '100%',
        days: 3,
    })(page)

    await pickHoveddiagnose({ search: 'Angst', select: /Angstlidelse/ })(page)

    await addUtdypendeSporsmal({
        utfodringerMedArbeid: 'Utfordringer',
        medisinskOppsummering: 'Oppsummering',
    })(page)

    await nextStep()(page)
    await verifySignerendeBehandler()(page)

    const { request, draftId } = await submitSykmelding()(page)
    await expectGraphQLRequest(request).toBe(OpprettSykmeldingDocument, {
        draftId: draftId,
        meta: { pasientIdent: '21037712323', orgnummer: null, legekontorTlf: null },
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
                utfodringerMedArbeid: 'Utfordringer',
                medisinskOppsummering: 'Oppsummering',
                hensynPaArbeidsplassen: null,
            },
        },
    })
})
