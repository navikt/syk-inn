import { ReadyClient } from '@navikt/smart-on-fhir/client'
import { GraphQLError } from 'graphql/error'

import { failSpan, spanServerAsync } from '#lib/otel/server'

import { Behandler, BehandlerMeta, Pasient } from './fhir-resource-types'
import { getHprFromFhir, getIdentFromFhir, getNameFromFhir, isValidIdent, isValidName } from './mappers/identifiers'
import { getOrganisasjonsnummerFromFhir, getOrganisasjonstelefonnummerFromFhir } from './mappers/organization'

export async function getPasient(client: ReadyClient): Promise<Pasient | null> {
    return spanServerAsync('FHIR.getPasient', async (span) => {
        const patient = await client.patient.request()
        if ('error' in patient) {
            throw new GraphQLError('PARSING_ERROR')
        }

        const patientName = getNameFromFhir(patient.name)
        const patientIdent = getIdentFromFhir(patient.identifier)

        if (!isValidIdent(patientIdent)) {
            failSpan(span, `Patient without valid ident: ${patientIdent.error}`)
            return null
        }

        if (!isValidName(patientName)) {
            failSpan(span, `Patient without valid name: ${patientName.error}`)
            return null
        }

        return { ident: patientIdent, navn: patientName }
    })
}

export async function getBehandler(client: ReadyClient): Promise<Behandler | null> {
    return spanServerAsync('FHIR.getBehandler', async (span) => {
        const practitioner = await client.user.request()
        if ('error' in practitioner) {
            failSpan(span, `Failed to get practitioner from FHIR: ${practitioner.error}`)
            return null
        }

        const hpr = getHprFromFhir(practitioner.identifier)
        if (!isValidIdent(hpr)) {
            failSpan(span, `Practitioner without HPR: ${hpr.error}`)
            return null
        }

        const navn = getNameFromFhir(practitioner.name)
        if (!isValidName(navn)) {
            failSpan(span, `Practitioner without valid name: ${navn.error}`)
            return null
        }

        return { hpr, navn, epost: null }
    })
}

export async function getExtendedBehandlerMeta(client: ReadyClient): Promise<BehandlerMeta | null> {
    return spanServerAsync('FHIR.getExtendedBehandlerMeta', async (span) => {
        const encounter = await client.encounter.request()
        if ('error' in encounter) {
            failSpan(span, `Failed to get encounter from FHIR: ${encounter.error}`)
            return null
        }

        const organization = await client.request(encounter.serviceProvider.reference as `Organization/${string}`)
        if ('error' in organization) {
            failSpan(span, `Failed to get organization from FHIR: ${organization.error}`)
            return null
        }

        const orgnummer = getOrganisasjonsnummerFromFhir(organization)
        if (orgnummer == null) {
            failSpan(span, `Organization without valid orgnummer`)
            return null
        }

        const legekontorTlf = getOrganisasjonstelefonnummerFromFhir(organization)
        if (legekontorTlf == null) {
            const cause = Error(
                `Organization without valid phone number, but we found ${organization.telecom.map((it) => it.system).join(', ')}`,
            )
            failSpan(span, `Organization without valid phone number`, cause)
            return null
        }

        return {
            orgnummer,
            legekontorTlf,
        }
    })
}
