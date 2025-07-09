import Valkey from 'iovalkey'

import { SykInnApiSykmelding } from '@services/syk-inn-api/schema/sykmelding'
import { OpprettSykmeldingPayload } from '@services/syk-inn-api/schema/opprett'
import { base64ExamplePdf } from '@navikt/fhir-mock-server/pdfs'

import { createDraftClient, DraftClient } from '../draft/draft-client'

import { sykInnApiPayloadToResponse } from './utils/syk-inn-api-mappers'
import { createInMemoryValkey } from './valkey/InMemValkey'
import { Scenario } from './scenarios/scenarios'

/**
 * A stateful mock system that scopes multiple parts of the application per user, e.g. the syk-inn-api and the drafts.
 */
export class MockEngine {
    private initialized = false

    private readonly valkey: Valkey
    private readonly scenario: Scenario

    public readonly sykInnApi: SykInnApiMock
    public readonly draftClient: DraftClient

    constructor(scenario: Scenario) {
        this.valkey = createInMemoryValkey()
        this.scenario = scenario

        this.sykInnApi = new SykInnApiMock(scenario.sykmeldinger)
        this.draftClient = createDraftClient(this.valkey)
    }

    get isInitialized(): boolean {
        return this.initialized
    }

    /**
     * Since he draft client is asyncronous, we'll have to put its
     * initial values into the store outside of the constructor.
     */
    async init(): Promise<void> {
        for (const draft of this.scenario.drafts) {
            await this.draftClient.saveDraft(draft.id, draft.owner, draft.values)
        }
    }
}

export class SykInnApiMock {
    private readonly _sykmeldinger: SykInnApiSykmelding[]

    constructor(sykmeldinger: SykInnApiSykmelding[]) {
        this._sykmeldinger = sykmeldinger
    }

    allSykmeldinger(): SykInnApiSykmelding[] {
        return this._sykmeldinger
    }

    sykmeldingById(sykmeldingId: string): SykInnApiSykmelding {
        const sykmelding = this._sykmeldinger.find((sykmelding) => sykmelding.sykmeldingId === sykmeldingId)

        if (!sykmelding) {
            throw new Error(`Sykmelding with id ${sykmeldingId} not found`)
        }

        return sykmelding
    }

    opprettSykmelding(payload: OpprettSykmeldingPayload): SykInnApiSykmelding {
        const newSykmelding: SykInnApiSykmelding = sykInnApiPayloadToResponse(crypto.randomUUID(), 'OK', payload)
        this._sykmeldinger.push(newSykmelding)
        return newSykmelding
    }

    getPdf(): Promise<ArrayBuffer> {
        const response = new Response(Buffer.from(base64ExamplePdf), {
            headers: { 'Content-Type': 'application/pdf' },
            status: 200,
        })

        return response.arrayBuffer()
    }
}
