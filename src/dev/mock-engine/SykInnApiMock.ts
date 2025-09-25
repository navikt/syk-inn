import { headers } from 'next/headers'

import {
    RuleResult,
    SykInnApiRuleOutcome,
    SykInnApiSykmelding,
    SykInnApiSykmeldingRedacted,
} from '@core/services/syk-inn-api/schema/sykmelding'
import { OpprettSykmeldingPayload } from '@core/services/syk-inn-api/schema/opprett'
import { sykInnApiPayloadToResponse } from '@dev/mock-engine/utils/syk-inn-api-mappers'
import { base64ExamplePdf } from '@navikt/fhir-mock-server/pdfs'
import { MockRuleMarkers } from '@dev/mock-engine/SykInnApiMockRuleMarkers'

export class SykInnApiMock {
    private readonly _sykmeldinger: (SykInnApiSykmelding | SykInnApiSykmeldingRedacted)[]

    constructor(sykmeldinger: (SykInnApiSykmelding | SykInnApiSykmeldingRedacted)[]) {
        this._sykmeldinger = sykmeldinger
    }

    allSykmeldinger(): (SykInnApiSykmelding | SykInnApiSykmeldingRedacted)[] {
        return this._sykmeldinger
    }

    sykmeldingById(sykmeldingId: string): SykInnApiSykmelding | SykInnApiSykmeldingRedacted {
        const sykmelding = this._sykmeldinger.find((sykmelding) => sykmelding.sykmeldingId === sykmeldingId)

        if (!sykmelding) {
            throw new Error(`Sykmelding with id ${sykmeldingId} not found`)
        }

        return sykmelding
    }

    async opprettSykmelding(payload: OpprettSykmeldingPayload): Promise<SykInnApiSykmelding> {
        const headersStore = await headers()
        const rule = headersStore.get(MockRuleMarkers.header)

        const utfall: RuleResult = { result: 'OK', melding: null }
        if (rule) {
            const [ruleName, status] = MockRuleMarkers.unwrapMarker(rule)
            utfall.result = status === 'INVALID' ? 'INVALID' : 'PENDING'
            utfall.melding = `This is a local development rule hit for rule ${ruleName}`
        }

        const newSykmelding: SykInnApiSykmelding = sykInnApiPayloadToResponse(crypto.randomUUID(), utfall, payload)
        this._sykmeldinger.push(newSykmelding)
        return newSykmelding
    }

    getPdf(): ArrayBuffer {
        const pdfBuffer = Uint8Array.from(atob(base64ExamplePdf), (c) => c.charCodeAt(0))

        return pdfBuffer.buffer
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async verifySykmelding(_: OpprettSykmeldingPayload): Promise<true | SykInnApiRuleOutcome> {
        const headersStore = await headers()

        const rule = headersStore.get(MockRuleMarkers.header)
        if (rule) {
            const [ruleName, status] = MockRuleMarkers.unwrapMarker(rule)
            return {
                status: status,
                rule: ruleName,
                message: 'This is a local development rule hit',
                tree: 'Local Mock Fake Tree',
            }
        }

        return true
    }
}
