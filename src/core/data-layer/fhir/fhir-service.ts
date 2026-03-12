import { ReadyClient } from '@navikt/smart-on-fhir/client'
import { GraphQLError } from 'graphql/error'

import { failSpan, spanServerAsync } from '@lib/otel/server'
import {
    getOrganisasjonsnummerFromFhir,
    getOrganisasjonstelefonnummerFromFhir,
} from '@data-layer/fhir/mappers/organization'
import { getValidPatientIdent } from '@data-layer/fhir/mappers/patient'
import { OpprettSykmeldingMeta } from '@core/services/syk-inn-api/schema/opprett'

/**
 * Chonky boi. Fetches the FHIR resources: Practitioner, Patient, Encounter and Organization, and extracts the relevant
 * metadata needed to create or validate a new sykmelding in syk-inn-api.
 */
export async function getAllSykmeldingMetaFromFhir(
    client: ReadyClient,
): Promise<Omit<OpprettSykmeldingMeta, 'source' | 'sykmelderHpr'>> {
    return spanServerAsync('FhirService.all-meta-resources', async (span) => {
        const encounter = await client.encounter.request()

        if ('error' in encounter) {
            failSpan(span, encounter.error)

            throw new GraphQLError('API_ERROR')
        }

        const [patient, organization] = await Promise.all([
            client.patient.request(),
            client.request(encounter.serviceProvider.reference as `Organization/${string}`),
        ])

        if ('error' in patient || 'error' in organization) {
            if ('error' in patient) failSpan(span, patient.error)
            if ('error' in organization) failSpan(span, organization.error)

            throw new GraphQLError('API_ERROR')
        }

        const legekontorOrgnr = getOrganisasjonsnummerFromFhir(organization)
        if (legekontorOrgnr == null) {
            failSpan(
                span,
                'Organization without valid orgnummer',
                new Error(`Organization without valid orgnummer: ${JSON.stringify(organization, null, 2)}`),
            )
            throw new GraphQLError('API_ERROR')
        }

        const legekontorTlf = getOrganisasjonstelefonnummerFromFhir(organization)
        if (legekontorTlf == null) {
            failSpan(
                span,
                'Organization without valid phone number',
                new Error(`Organization without valid phone number: ${JSON.stringify(organization, null, 2)}`),
            )
            throw new GraphQLError('API_ERROR')
        }

        const pasientIdent = getValidPatientIdent(patient.identifier)
        if (pasientIdent == null) {
            failSpan(
                span,
                'Patient without valid FNR/DNR',
                new Error(
                    `Patient without valid FNR/DNR, found OIDs: ${patient.identifier?.map((id) => id.system).join(', ') || 'none'}`,
                ),
            )
            throw new GraphQLError('API_ERROR')
        }

        return {
            pasientIdent,
            legekontorOrgnr,
            legekontorTlf,
        }
    })
}
