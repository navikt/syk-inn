import { test } from '@playwright/test'

import { toReadableDatePeriod } from '#lib/date'
import { inDays, today } from '#lib/test/date-utils'
import { OpprettSykmeldingDocument } from '#queries'

import { fillReisetilskuddPeriode, nextStep, selectReisetilskuddType, submitSykmelding } from '../actions/user-actions'
import { verifySummaryPage } from '../actions/user-verifications'
import { anything, expectGraphQLRequest } from '../utils/assertions'
import {
    defaultAktivitetGradert,
    defaultOpprettSykmeldingValues,
    defaultReisetilskudd,
    diagnoseSelection,
} from '../utils/submit-utils'

import { launchWithMock } from './actions/fhir-actions'
import { startNewAlternateSykmelding } from './actions/fhir-user-actions'
import { verifyIsOnKvitteringPage, verifySignerendeBehandler } from './actions/fhir-user-verifications'

test('simple full reisetilskudd sykmelding ', async ({ page }) => {
    await launchWithMock('empty')(page)
    await startNewAlternateSykmelding('REISETILSKUDD')(page)

    await fillReisetilskuddPeriode({ days: 7 })(page)
    // 100% reisetilskudd is default

    await nextStep()(page)
    await verifySignerendeBehandler()(page)
    await verifySummaryPage([
        { name: 'Periode', values: [new RegExp(toReadableDatePeriod(inDays(0), inDays(7)))] },
        { name: 'Periode', values: [/Sykmelding med reisetilskudd/] },
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
                defaultReisetilskudd({
                    fom: today(),
                    tom: inDays(7),
                }),
            ],
        },
    })

    await verifyIsOnKvitteringPage()(page)
})

test('simple gradert reisetilskudd sykmelding ', async ({ page }) => {
    await launchWithMock('empty')(page)
    await startNewAlternateSykmelding('REISETILSKUDD')(page)

    await fillReisetilskuddPeriode({ days: 7 })(page)
    await selectReisetilskuddType({ grad: 60 })(page)

    await nextStep()(page)
    await verifySignerendeBehandler()(page)
    await verifySummaryPage([
        { name: 'Periode', values: [new RegExp(toReadableDatePeriod(inDays(0), inDays(7)))] },
        { name: 'Periode', values: [/Gradert sykmelding \(60%\), med reisetilskudd/] },
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
                defaultAktivitetGradert({
                    fom: today(),
                    tom: inDays(7),
                    grad: 60,
                    reisetilskudd: true,
                }),
            ],
        },
    })

    await verifyIsOnKvitteringPage()(page)
})
