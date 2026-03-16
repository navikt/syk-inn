import {
    FhirQuestionnaireResponse,
    FhirQuestionnaireResponseAnswer,
    FhirQuestionnaireResponseItem,
} from '@navikt/smart-on-fhir/zod'

import { SykInnApiSykmelding } from '@core/services/syk-inn-api/schema/sykmelding'
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
