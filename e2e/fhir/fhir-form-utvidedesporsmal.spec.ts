import { test } from '@playwright/test'

import { OpprettSykmeldingDocument } from '@queries'

import {
    addUtdypendeSporsmal,
    fillPeriodeRelative,
    nextStep,
    pickHoveddiagnose,
    submitSykmelding,
} from '../actions/user-actions'
import { userInteractionsGroup } from '../utils/actions'
import { verifySignerendeBehandler } from '../actions/user-verifications'
import { expectGraphQLRequest } from '../utils/assertions'
import { today, inDays } from '../utils/date-utils'
import { getDraftId } from '../utils/request-utils'

import { launchWithMock } from './actions/fhir-actions'
import { startNewSykmelding } from './actions/fhir-user-actions'

const launchAndStart = userInteractionsGroup(
    launchWithMock('utfyllende-sporsmal'),
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

    const request = await submitSykmelding()(page)
    await expectGraphQLRequest(request).toBe(OpprettSykmeldingDocument, {
        draftId: getDraftId(page) ?? 'missing',
        pasientIdent: '21037712323',
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
