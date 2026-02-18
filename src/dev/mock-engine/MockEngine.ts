import Valkey from 'iovalkey'

import type { AaregArbeidsforhold } from '@core/services/aareg/aareg-schema'
import { createBruksvilkarClient, type BruksvilkarClient } from '@core/services/bruksvilkar/bruksvilkar-client'
import { createDraftClient, type DraftClient } from '@data-layer/draft/draft-client'
import { SykInnApiMock } from '@dev/mock-engine/SykInnApiMock'

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
    public readonly bruksvilkarClient: BruksvilkarClient

    constructor(scenario: Scenario) {
        this.valkey = createInMemoryValkey()
        this.scenario = scenario

        this.sykInnApi = new SykInnApiMock(scenario.sykmeldinger)
        this.arbeidsforhold = new AaregMock(scenario.arbeidsforhold)
        this.bruksvilkarClient = createBruksvilkarClient(this.valkey)
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
