import { logger } from '@navikt/next-logger'

import { FhirPractitioner, GeneralIdentifier } from '@navikt/fhir-zod'
import { Behandler } from '@data-layer/resources'
import { getName } from '@data-layer/fhir/mappers/patient'

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
            logger.error(`Unknown OID: ${urn}, value: ${value}`)
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

export function practitionerToBehandler(practitioner: FhirPractitioner): Behandler {
    const hpr = getHpr(practitioner.identifier)
    if (hpr == null) {
        // TODO: Don't log name? :shrug:
        throw new Error(`Practitioner without HPR (${practitioner.name})`)
    }

    return {
        navn: getName(practitioner.name),
        hpr: hpr,
    }
}
