import { sykmeldingQuestionnaireV1 } from '@data-layer/fhir/write/resources/questionnaire/sykmelding-questionnaire'

export const dynamic = 'force-static'

export function GET(): Response {
    return Response.json(sykmeldingQuestionnaireV1, {
        headers: { 'Content-Type': 'application/fhir+json' },
        status: 200,
    })
}
