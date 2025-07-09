import { SykInnApiSykmelding } from '@services/syk-inn-api/schema/sykmelding'
import { OpprettSykmeldingPayload } from '@services/syk-inn-api/schema/opprett'
import { base64ExamplePdf } from '@navikt/fhir-mock-server/pdfs'

import { sykInnApiPayloadToResponse } from './utils/syk-inn-api-mappers'

/**
 * A stateful mock for the SykInn API. Allows the user to read, write, and modify the state of the "API" in demo/e2e.
 */
export class MockSykInnApi {
    private readonly _sykmeldinger: SykInnApiSykmelding[]

    constructor(scenario: { sykmeldinger: SykInnApiSykmelding[] }) {
        this._sykmeldinger = scenario.sykmeldinger
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
