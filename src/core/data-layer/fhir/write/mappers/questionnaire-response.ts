import { FhirQuestionnaireResponse } from '@navikt/smart-on-fhir/zod'

import { SykInnApiSykmelding } from '@core/services/syk-inn-api/schema/sykmelding'

export function sykmeldingToQuestionnaireResponse(sykmelding: SykInnApiSykmelding): FhirQuestionnaireResponse {
    return {
        resourceType: 'QuestionnaireResponse',
        id: sykmelding.sykmeldingId,
        status: 'completed',
        item: [],
    }
}
