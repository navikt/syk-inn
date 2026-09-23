import { logger } from '@navikt/next-logger'
import { FhirPractitioner } from '@navikt/smart-on-fhir/zod'
import { GraphQLError } from 'graphql/error'

import { Behandler } from '#resolvers'

import { getHprFromFhir, getIdentFromFhir, getNameFromFhir, isValidIdent, isValidName } from './mappers/identifiers'

/**
 * In a GraphQL context, asserts that the mapped patient ID is usable.
 */
export function assertValidIdent(ident: ReturnType<typeof getIdentFromFhir>): asserts ident is string {
    if (isValidIdent(ident)) return

    logger.error(`Unable to verify patient ident, cause ${ident.error}, reason: ${ident.details}`)
    throw new GraphQLError('API_ERROR')
}

/**
 * In a GraphQL context, asserts that the mapped patient name is usable.
 */
export function assertValidName(name: ReturnType<typeof getNameFromFhir>): asserts name is string {
    if (isValidName(name)) return

    logger.error(`Unable to verify patient name, cause ${name.error}`)
    throw new GraphQLError('API_ERROR')
}

/**
 * In a GraphQL context, map a valid practitioner to a GQL Behandler
 */
export function practitionerToBehandler(practitioner: FhirPractitioner): Pick<Behandler, 'hpr' | 'navn' | 'epost'> {
    const hpr = getHprFromFhir(practitioner.identifier)
    if (!isValidIdent(hpr)) {
        throw new Error(`Practitioner without HPR, FHIR ID: ${practitioner.id}`)
    }

    const practitionerName = getNameFromFhir(practitioner.name)
    assertValidName(practitionerName)

    return {
        navn: practitionerName,
        hpr: hpr,
        // TODO: Get from telecom
        epost: null,
    }
}
