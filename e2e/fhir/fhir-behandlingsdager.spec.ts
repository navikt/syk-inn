import { test } from '@playwright/test'
import { toReadableDatePeriod } from '@lib/date'
import { inDays, today } from '@lib/test/date-utils'
import { OpprettSykmeldingDocument } from '@queries'

import {
    fillBehandlingsdagerExplanation,
    fillBehandlingsdagerPeriode,
    nextStep,
    submitSykmelding,
} from '../actions/user-actions'
import { verifySummaryPage } from '../actions/user-verifications'
import { anything, expectGraphQLRequest } from '../utils/assertions'
import { defaultBehandlingsdager, defaultOpprettSykmeldingValues, diagnoseSelection } from '../utils/submit-utils'

import { launchWithMock } from './actions/fhir-actions'
import { startNewAlternateSykmelding } from './actions/fhir-user-actions'
import { verifyIsOnKvitteringPage, verifySignerendeBehandler } from './actions/fhir-user-verifications'

test('simple full behandlingsdager sykmelding @feature-toggle ', async ({ page }) => {
    await launchWithMock('empty', { SYK_INN_SYKMELDING_BEHANDLINGSDAGER: true })(page)
    await startNewAlternateSykmelding('BEHANDLINGSDAGER', {
        name: 'Espen Eksempel',
        fnr: '21037712323',
    })(page)

    const testExplanation =
        'Skal til kiropraktor på Kjelsås for å fikse ryggen hver mandag, men av og til tirsdag dersom Jupiter er i retrograde.'

    await fillBehandlingsdagerPeriode({ days: 7 })(page)
    await fillBehandlingsdagerExplanation(testExplanation)(page)

    await nextStep()(page)
    await verifySignerendeBehandler()(page)
    await verifySummaryPage([
        {
            name: 'Periode',
            values: [new RegExp(toReadableDatePeriod(inDays(0), inDays(7)))],
        },
        {
            name: 'Periode',
            values: [/Sykmelding med behandlingsdager/],
        },
        { name: 'Til NAV', values: [testExplanation] },
    ])(page)

    const { request, draftId } = await submitSykmelding()(page)
    await expectGraphQLRequest(request).toBe(OpprettSykmeldingDocument, {
        draftId: draftId,
        meta: anything(),
        force: false,
        values: {
            ...defaultOpprettSykmeldingValues,
            hoveddiagnose: diagnoseSelection.any.verify,
            aktivitet: [
                defaultBehandlingsdager({
                    fom: today(),
                    tom: inDays(7),
                }),
            ],
            meldinger: { tilNav: testExplanation, tilArbeidsgiver: null },
        },
    })

    await verifyIsOnKvitteringPage()(page)
})
