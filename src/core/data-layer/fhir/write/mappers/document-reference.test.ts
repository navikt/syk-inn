import { describe, expect, it } from 'vitest'

import { SykmeldingBuilder } from '#dev/mock-engine/scenarios/SykInnApiSykmeldingBuilder'

import { sykmeldingToDocumentReference } from './document-reference'

const REFS = {
    patientId: 'patient-1',
    encounterId: 'encounter-1',
    practitionerId: 'practitioner-1',
}
const EMPTY_PDF = new ArrayBuffer(0)

describe('sykmeldingToDocumentReference', () => {
    it('maps basic structure correctly', () => {
        const sykmelding = new SykmeldingBuilder().enkelAktivitet().build()
        const result = sykmeldingToDocumentReference(sykmelding, EMPTY_PDF, REFS)

        expect(result.resourceType).toBe('DocumentReference')
        expect(result.id).toBe(sykmelding.sykmeldingId)
        expect(result.status).toBe('current')
        expect(result.type.coding[0].code).toBe('J01-2')
        expect(result.subject.reference).toBe('Patient/patient-1')
        expect(result.author[0].reference).toBe('Practitioner/practitioner-1')
        expect(result.context.encounter[0].reference).toBe('Encounter/encounter-1')
        expect(result.content[0].attachment.contentType).toBe('application/pdf')
    })

    it('sets context.period from earliest fom and latest tom', () => {
        const sykmelding = new SykmeldingBuilder()
            .aktivitet({ type: 'REISETILSKUDD', fom: '2026-01-01', tom: '2026-01-15' })
            .aktivitet({ type: 'REISETILSKUDD', fom: '2026-01-16', tom: '2026-02-01' })
            .build()
        const result = sykmeldingToDocumentReference(sykmelding, EMPTY_PDF, REFS)

        expect(result.context.period?.start).toBe('2026-01-01')
        expect(result.context.period?.end).toBe('2026-02-01')
    })

    it('includes context.related when a questionnaire response reference is provided', () => {
        const sykmelding = new SykmeldingBuilder().enkelAktivitet().build()
        const result = sykmeldingToDocumentReference(
            sykmelding,
            EMPTY_PDF,
            REFS,
            `QuestionnaireResponse/${sykmelding.sykmeldingId}`,
        )

        expect(result.context.related?.[0].reference).toBe(`QuestionnaireResponse/${sykmelding.sykmeldingId}`)
    })

    it('omits context.related when related is null', () => {
        const sykmelding = new SykmeldingBuilder().enkelAktivitet().build()
        const result = sykmeldingToDocumentReference(sykmelding, EMPTY_PDF, REFS, null)

        expect(result.context.related).toBeUndefined()
    })
})
