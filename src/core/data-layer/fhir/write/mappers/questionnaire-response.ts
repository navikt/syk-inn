import {
    FhirQuestionnaireResponse,
    FhirQuestionnaireResponseAnswer,
    FhirQuestionnaireResponseItem,
} from '@navikt/smart-on-fhir/zod'

import { SykInnApiAktivitet, SykInnApiSykmelding } from '@core/services/syk-inn-api/schema/sykmelding'
import { Diagnose } from '@data-layer/common/diagnose'
import { diagnosisSystemToUrn } from '@data-layer/fhir/mappers/diagnosis'

export function sykmeldingToQuestionnaireResponse(
    sykmelding: SykInnApiSykmelding,
    references: { patientId: string; encounterId: string; practitionerId: string },
): FhirQuestionnaireResponse {
    return {
        resourceType: 'QuestionnaireResponse',
        id: sykmelding.sykmeldingId,
        status: 'completed',
        questionnaire: 'https://www.nav.no/samarbeidspartner/sykmelding/fhir/R4/Questionnaire/V1',
        subject: { reference: `Patient/${references.patientId}` },
        author: { reference: `Practitioner/${references.practitionerId}` },
        authored: new Date().toISOString(),
        encounter: { reference: `Encounter/${references.encounterId}` },
        item: sykmeldingValuesToItems(sykmelding.values),
    }
}

function sykmeldingValuesToItems(values: SykInnApiSykmelding['values']): FhirQuestionnaireResponseItem[] {
    const items: FhirQuestionnaireResponseItem[] = []

    if (values.hoveddiagnose) {
        items.push({
            linkId: 'hoveddiagnose',
            text: 'Hoveddiagnose',
            answer: [toDiagnoseValueAnswer(values.hoveddiagnose)],
        })
    }

    if (values.bidiagnoser && values.bidiagnoser.length > 0) {
        items.push({
            linkId: 'bidiagnoser',
            text: 'Bidiagnose',
            answer: values.bidiagnoser.map(toDiagnoseValueAnswer),
        })
    }

    if (values.arbeidsgiver) {
        items.push({
            linkId: 'arbeidsforhold',
            text: 'Arbeidsforhold sykmeldingen gjelder for',
            answer: [
                {
                    valueString: values.arbeidsgiver.arbeidsgivernavn,
                },
            ],
        })
    }

    if (values.aktivitet && values.aktivitet.length > 0) {
        items.push(...values.aktivitet.map(toAktivitetItem))
    }

    if (values.svangerskapsrelatert) {
        items.push({
            linkId: 'svangerskapsrelatert',
            text: 'Svangerskapsrelatert',
            answer: [
                {
                    valueBoolean: values.svangerskapsrelatert,
                },
            ],
        })
    }

    if (values.yrkesskade) {
        items.push(toYrkesskadeItem(values.yrkesskade))
    }

    return items
}

function toDiagnoseValueAnswer(diagnose: Diagnose): FhirQuestionnaireResponseAnswer {
    return {
        valueCoding: {
            system: diagnosisSystemToUrn(diagnose.system),
            code: diagnose.code,
            display: diagnose.text,
        },
    }
}

const aktivitetTypeDisplay: Record<SykInnApiAktivitet['type'], string> = {
    AKTIVITET_IKKE_MULIG: 'Aktivitet ikke mulig',
    GRADERT: 'Gradert',
    AVVENTENDE: 'Avventende',
    BEHANDLINGSDAGER: 'Behandlingsdager',
    REISETILSKUDD: 'Reisetilskudd',
}

function toAktivitetItem(aktivitet: SykInnApiAktivitet): FhirQuestionnaireResponseItem {
    const aktivitetItems: FhirQuestionnaireResponseItem[] = [
        {
            linkId: 'aktivitet-type',
            text: 'Aktivetstype',
            answer: [{ valueCoding: { code: aktivitet.type, display: aktivitetTypeDisplay[aktivitet.type] } }],
        },
        {
            linkId: 'aktivitet-fom',
            text: 'Fra og med dato',
            answer: [{ valueDate: aktivitet.fom }],
        },
        {
            linkId: 'aktivitet-tom',
            text: 'Til og med dato',
            answer: [{ valueDate: aktivitet.tom }],
        },
    ]

    if (aktivitet.type === 'GRADERT') {
        aktivitetItems.push({
            linkId: 'aktivitet-grad',
            text: 'Sykmeldingsgrad (prosent)',
            answer: [{ valueInteger: aktivitet.grad }],
        })
    }

    return {
        linkId: 'aktivitet',
        text: 'Sykmeldingsperiode',
        item: aktivitetItems,
    }
}

function toYrkesskadeItem(
    yrkesskade: NonNullable<SykInnApiSykmelding['values']['yrkesskade']>,
): FhirQuestionnaireResponseItem {
    return {
        linkId: 'yrkesskade',
        text: 'Yrkesskade',
        item: [
            {
                linkId: 'yrkesskade-er-yrkesskade',
                text: 'Sykmelding kan skyldes en yrkesskade eller yrkessykdom',
                answer: [{ valueBoolean: yrkesskade.yrkesskade }],
            },
            ...(yrkesskade.skadedato !== null
                ? [{ linkId: 'yrkesskade-skadedato', text: 'Skadedato', answer: [{ valueDate: yrkesskade.skadedato }] }]
                : []),
        ],
    }
}
