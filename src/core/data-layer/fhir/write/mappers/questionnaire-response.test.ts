import { describe, expect, it } from 'vitest'
import { FhirQuestionnaireResponse } from '@navikt/smart-on-fhir/zod'

import { SykmeldingBuilder } from '@dev/mock-engine/scenarios/SykInnApiSykmeldingBuilder'

import { sykmeldingToQuestionnaireResponse } from './questionnaire-response'

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
            { valueCoding: { code: 'K24', display: 'Eksempeldiagnose 1', system: 'urn:oid:2.16.578.1.12.4.1.1.7170' } },
        ])
    })
})

function getRootItem(
    linkId: string,
    items: FhirQuestionnaireResponse['item'],
): FhirQuestionnaireResponse['item'][number] {
    const item = items.find((item) => item.linkId === linkId) ?? null

    if (item == null) {
        expect.fail(item, `Item with linkId '${linkId}' was not found among the ${items.length} items`)
    }

    return item
}
