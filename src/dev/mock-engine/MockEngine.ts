import Valkey from 'iovalkey'

import { SykInnApiSykmelding, SykInnApiSykmeldingLight } from '@core/services/syk-inn-api/schema/sykmelding'
import { OpprettSykmeldingPayload } from '@core/services/syk-inn-api/schema/opprett'
import { AaregArbeidsforhold } from '@core/services/aareg/aareg-schema'
import { base64ExamplePdf } from '@navikt/fhir-mock-server/pdfs'
import { createDraftClient, DraftClient } from '@data-layer/draft/draft-client'

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
    public readonly arbeidsforhold: AaregMock
    public readonly draftClient: DraftClient

    constructor(scenario: Scenario) {
        this.valkey = createInMemoryValkey()
        this.scenario = scenario

        this.sykInnApi = new SykInnApiMock(scenario.sykmeldinger)
        this.arbeidsforhold = new AaregMock(scenario.arbeidsforhold)
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
        if (this.isInitialized) return

        for (const draft of this.scenario.drafts) {
            await this.draftClient.saveDraft(
                draft.id,
                draft.owner,
                draft.values,
                // @ts-expect-error: saveDraft has a fourth un-typed parameter for providing a last updated date
                draft.lastUpdated,
            )
        }
        this.initialized = true
    }
}

export class AaregMock {
    private readonly arbeidsforhold: AaregArbeidsforhold[]

    constructor(arbeidsforhold: AaregArbeidsforhold[]) {
        this.arbeidsforhold = arbeidsforhold
    }

    getArbeidsforhold(): AaregArbeidsforhold[] {
        return this.arbeidsforhold
    }
}

export class SykInnApiMock {
    private readonly _sykmeldinger: (SykInnApiSykmelding | SykInnApiSykmeldingLight)[]

    constructor(sykmeldinger: (SykInnApiSykmelding | SykInnApiSykmeldingLight)[]) {
        this._sykmeldinger = sykmeldinger
    }

    allSykmeldinger(): (SykInnApiSykmelding | SykInnApiSykmeldingLight)[] {
        return this._sykmeldinger
    }

    sykmeldingById(sykmeldingId: string): SykInnApiSykmelding | SykInnApiSykmeldingLight {
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

    getPdf(): ArrayBuffer {
        const pdfBuffer = Uint8Array.from(atob(base64ExamplePdf), (c) => c.charCodeAt(0))

        return pdfBuffer.buffer
    }
}
