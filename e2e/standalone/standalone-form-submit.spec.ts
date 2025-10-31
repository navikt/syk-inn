import { test, expect } from '@playwright/test'

import { OpprettSykmeldingDocument } from '@queries'

import { inDays, today } from '../utils/date-utils'
import {
    fillPeriodeRelative,
    pickHoveddiagnose,
    submitSykmelding,
    nextStep,
    addBidiagnose,
} from '../actions/user-actions'
import { expectGraphQLRequest } from '../utils/assertions'
import { getDraftId } from '../utils/request-utils'
import { verifySummaryPage } from '../actions/user-verifications'

import { launchWithMock } from './actions/standalone-actions'
import { searchPerson, startNewSykmelding } from './actions/standalone-user-actions'
import { verifySignerendeBehandler } from './actions/standalone-user-verifications'

test('simple - 100% sykmelding', async ({ page }) => {
    await launchWithMock('empty', {
        behandler: 'Johan Johansson',
    })(page)

    await searchPerson('21037712323')(page)
    await startNewSykmelding('21037712323')(page)

    await fillPeriodeRelative({
        type: '100%',
        days: 3,
    })(page)

    await pickHoveddiagnose({ search: 'Angst', select: /Angstlidelse/ })(page)
    await addBidiagnose({ search: 'P17', select: /Tobakkmisbruk/ })(page)

    await nextStep()(page)
    await verifySignerendeBehandler('123456')(page)
    await verifySummaryPage([
        {
            name: 'Periode',
            values: [/100% sykmelding/],
        },
    ])(page)

    const request = await submitSykmelding()(page)
    await expectGraphQLRequest(request).toBe(OpprettSykmeldingDocument, {
        draftId: getDraftId(page) ?? 'missing',
        pasientIdent: '21037712323',
        force: false,
        values: {
            hoveddiagnose: { system: 'ICPC2', code: 'P74' },
            bidiagnoser: [{ system: 'ICPC2', code: 'P17' }],
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

    await expect(page.getByRole('heading', { name: 'Kvittering på innsendt sykmelding' })).toBeVisible()
})
