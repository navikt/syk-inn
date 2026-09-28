import { FhirQuestionnaireResponse, FhirQuestionnaireResponseItem } from '@navikt/smart-on-fhir/zod'
import { assert, describe, expect, it } from 'vitest'

import { SykmeldingBuilder } from '#dev/mock-engine/scenarios/SykInnApiSykmeldingBuilder'

import { sykmeldingToQuestionnaireResponse } from './questionnaire-response'

const REFS = {
    patientId: 'patient-1',
    encounterId: 'encounter-1',
    practitionerId: 'practitioner-1',
}

describe('QuestionnaireResponseMapper', () => {
    it('basic mapper test', () => {
        const result = sykmeldingToQuestionnaireResponse(
            new SykmeldingBuilder({ offset: -3 })
                .relativeAktivitet({ type: 'GRADERT', grad: 60, reisetilskudd: false }, { days: 7, offset: 0 })
                .relativeAktivitet({ type: 'GRADERT', grad: 60, reisetilskudd: false }, { days: 3, offset: 8 })
                .meldinger({
                    tilNav: 'Dette er en melding til NAV',
                    tilArbeidsgiver: 'Dette er en melding til arbeidsgiver',
                })
                .build(),
            {
                patientId: 'ad368fcd-4f00-44bc-a212-64e7e18afd1d',
                encounterId: '0b0d9e64-cfae-4040-aa3f-ab721d0a6933',
                practitionerId: '3a1bc187-a588-4203-9550-36280d8ee4eb',
            },
        )

        expect(result.resourceType).toBe('QuestionnaireResponse')
        expect(result.encounter?.reference).toEqual('Encounter/0b0d9e64-cfae-4040-aa3f-ab721d0a6933')
        expect(result.subject?.reference).toEqual('Patient/ad368fcd-4f00-44bc-a212-64e7e18afd1d')
        expect(result.author?.reference).toEqual('Practitioner/3a1bc187-a588-4203-9550-36280d8ee4eb')

        expect(getRootItem('hoveddiagnose', result.item).answer).toEqual([
            {
                valueCoding: {
                    code: 'K24',
                    display: 'Eksempeldiagnose 1',
                    system: 'urn:oid:2.16.578.1.12.4.1.1.7170',
                },
            },
        ])
    })
})

describe('aktivitet mapping', () => {
    it('maps AKTIVITET_IKKE_MULIG with type, fom, tom and no aktivitet-grad', () => {
        const result = sykmeldingToQuestionnaireResponse(
            new SykmeldingBuilder()
                .aktivitetIkkeMulig({
                    type: 'AKTIVITET_IKKE_MULIG',
                    fom: '2026-01-01',
                    tom: '2026-01-16',
                })
                .build(),
            REFS,
        )

        const aktivitet = getRootItem('aktivitet', result.item)
        expect(getChildItem('aktivitet-type', aktivitet).answer).toEqual([
            { valueCoding: { code: 'AKTIVITET_IKKE_MULIG', display: 'Aktivitet ikke mulig' } },
        ])
        expect(getChildItem('aktivitet-fom', aktivitet).answer).toEqual([{ valueDate: '2026-01-01' }])
        expect(getChildItem('aktivitet-tom', aktivitet).answer).toEqual([{ valueDate: '2026-01-16' }])
        expect(aktivitet.item?.find((item) => item.linkId === 'aktivitet-grad')).toBeUndefined()
    })

    it('maps GRADERT with aktivitet_grad', () => {
        const result = sykmeldingToQuestionnaireResponse(
            new SykmeldingBuilder()
                .aktivitet({
                    type: 'GRADERT',
                    grad: 60,
                    reisetilskudd: false,
                    fom: '2026-02-01',
                    tom: '2026-03-01',
                })
                .build(),
            REFS,
        )

        const aktivitet = getRootItem('aktivitet', result.item)
        expect(getChildItem('aktivitet-grad', aktivitet).answer).toEqual([{ valueInteger: 60 }])
    })

    it('maps multiple periods as separate root level aktivitet items', () => {
        const result = sykmeldingToQuestionnaireResponse(
            new SykmeldingBuilder()
                .aktivitetIkkeMulig({ type: 'AKTIVITET_IKKE_MULIG', fom: '2026-01-01', tom: '2026-02-28' })
                .aktivitet({ type: 'GRADERT', grad: 60, reisetilskudd: false, fom: '2026-03-01', tom: '2026-03-31' })
                .aktivitet({ type: 'GRADERT', grad: 40, reisetilskudd: false, fom: '2026-04-01', tom: '2026-04-20' })
                .build(),
            REFS,
        )

        const aktivitetItems = result.item.filter((item) => item.linkId === 'aktivitet')

        expect(aktivitetItems).toHaveLength(3)
        expect(getChildItem('aktivitet-type', aktivitetItems[0]).answer).toEqual([
            { valueCoding: { code: 'AKTIVITET_IKKE_MULIG', display: 'Aktivitet ikke mulig' } },
        ])
        expect(getChildItem('aktivitet-type', aktivitetItems[1]).answer).toEqual([
            { valueCoding: { code: 'GRADERT', display: 'Gradert' } },
        ])
        expect(getChildItem('aktivitet-type', aktivitetItems[2]).answer).toEqual([
            { valueCoding: { code: 'GRADERT', display: 'Gradert' } },
        ])
        expect(getChildItem('aktivitet-grad', aktivitetItems[1]).answer).toEqual([{ valueInteger: 60 }])
        expect(getChildItem('aktivitet-grad', aktivitetItems[2]).answer).toEqual([{ valueInteger: 40 }])
    })
})

describe('arbeidsforhold mapping', () => {
    it('maps arbeidsgivernavn as valueString', () => {
        const result = sykmeldingToQuestionnaireResponse(new SykmeldingBuilder().enkelAktivitet().build(), REFS)

        expect(getRootItem('arbeidsforhold', result.item).answer).toEqual([{ valueString: 'Default AS' }])
    })
})

describe('bidiagnoser mapping', () => {
    it('maps multiple bidiagnoser as multiple answers on one line', () => {
        const sykmelding = new SykmeldingBuilder().enkelAktivitet().build()
        sykmelding.values.bidiagnoser = [
            { system: 'ICPC2', code: 'L99', text: 'Diagnose 1' },
            { system: 'ICD10', code: 'M54', text: 'Diagnose 2' },
            { system: 'ICPC2B', code: 'S44', text: 'Diagnose 3' },
        ]

        const result = sykmeldingToQuestionnaireResponse(sykmelding, REFS)
        const bidiagnoser = getRootItem('bidiagnoser', result.item)

        expect(bidiagnoser.answer).toHaveLength(3)
        expect(bidiagnoser.answer?.[0].valueCoding?.code).toBe('L99')
        expect(bidiagnoser.answer?.[1].valueCoding?.code).toBe('M54')
        expect(bidiagnoser.answer?.[2].valueCoding?.code).toBe('S44')
    })
})

describe('yrkesskade mapping', () => {
    it('maps yrkesskade with skadedato', () => {
        const sykmelding = new SykmeldingBuilder().enkelAktivitet().build()
        sykmelding.values.yrkesskade = { yrkesskade: true, skadedato: '2026-01-01' }

        const result = sykmeldingToQuestionnaireResponse(sykmelding, REFS)
        const yrkesskade = getRootItem('yrkesskade', result.item)

        expect(getChildItem('yrkesskade-er-yrkesskade', yrkesskade).answer).toEqual([{ valueBoolean: true }])
        expect(getChildItem('yrkesskade-skadedato', yrkesskade).answer).toEqual([{ valueDate: '2026-01-01' }])
    })

    it('omits yrkesskade-skadedato when skadedato is null', () => {
        const sykmelding = new SykmeldingBuilder().enkelAktivitet().build()
        sykmelding.values.yrkesskade = { yrkesskade: true, skadedato: null }

        const result = sykmeldingToQuestionnaireResponse(sykmelding, REFS)
        const yrkesskade = getRootItem('yrkesskade', result.item)

        expect(yrkesskade.item).toHaveLength(1)
        expect(yrkesskade.item?.[0].linkId).toBe('yrkesskade-er-yrkesskade')
    })
})

function getRootItem(
    linkId: string,
    items: FhirQuestionnaireResponse['item'],
): FhirQuestionnaireResponse['item'][number] {
    const item = items.find((item) => item.linkId === linkId) ?? null

    if (item == null) {
        assert.fail(item, `Item with linkId '${linkId}' was not found among the ${items.length} items`)
    }

    return item
}

function getChildItem(
    linkId: string,
    parent: FhirQuestionnaireResponse['item'][number],
): FhirQuestionnaireResponse['item'][number] {
    const item =
        (parent.item as FhirQuestionnaireResponseItem[] | undefined)?.find((item) => item.linkId === linkId) ?? null

    if (item === null) {
        assert.fail(item, `Child item '${linkId}' not found`)
    }

    return item
}
