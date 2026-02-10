import { logger } from '@navikt/next-logger'
import { teamLogger } from '@navikt/next-logger/team-log'
import { FhirPractitioner, GeneralIdentifier } from '@navikt/smart-on-fhir/zod'

import { getNameFromFhir } from '@data-layer/fhir/mappers/patient'
import { Behandler } from '@resolvers'

const FNR_OID = '2.16.578.1.12.4.1.4.1'
const DNR_OID = '2.16.578.1.12.4.1.4.2'
const HPR_OID = '2.16.578.1.12.4.1.4.4'

/**
 * Kilde: https://www.ehelse.no/teknisk-dokumentasjon/oid-identifikatorserier-i-helse-og-omsorgstjenesten
 */
export function userUrnToOidType(urn: string, value: string): 'fnr' | 'dnr' | 'hpr' | 'annet' {
    switch (urn.replace('urn:oid:', '')) {
        case FNR_OID:
            return 'fnr'
        case DNR_OID:
            return 'dnr'
        case HPR_OID:
            return 'hpr'
        default:
            logger.error(`Unknown OID: ${urn}, see team logs for value.`)
            teamLogger.error(`Unknown OID: ${urn}, value: ${value}`)
            return 'annet'
    }
}

export function getHpr(identifiers: GeneralIdentifier | GeneralIdentifier[]): string | null {
    const ids = Array.isArray(identifiers) ? identifiers : [identifiers]
    const hprIdentifier = ids.find((id) => id.system.startsWith('urn:oid') && id.system.includes(HPR_OID))

    if (hprIdentifier == null) {
        return null
    }

    return hprIdentifier.value
}

export function practitionerToBehandler(practitioner: FhirPractitioner): Pick<Behandler, 'hpr' | 'navn' | 'epost'> {
    const hpr = getHpr(practitioner.identifier)
    if (hpr == null) {
        teamLogger.error(`Practitioner without HPR: ${JSON.stringify(practitioner, null, 2)}`)
        throw new Error(`Practitioner without HPR (see team logs for name)`)
    }

    return {
        navn: getNameFromFhir(practitioner.name),
        hpr: hpr,
        // TODO: Get from telecom
        epost: null,
    }
}
