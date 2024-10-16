import { logger } from '@navikt/next-logger'

import { FhirPatient } from '../patient'

export function getName(patient: FhirPatient): string {
    return `${patient.name[0].given[0]} ${patient.name[0].family}`
}

export function getOid(patient: FhirPatient): {
    type: 'fødselsnummer' | 'd-nummer' | 'annet nummer'
    nr: string
} | null {
    if (patient.identifier == null) {
        return null
    }

    const oid = patient.identifier.find((id) => id.system.startsWith('urn:oid'))
    if (oid == null) {
        return null
    }

    return {
        type: urnToOidType(oid.system, oid.value),
        nr: oid.value,
    }
}

/**
 * Kilde: https://www.ehelse.no/teknisk-dokumentasjon/oid-identifikatorserier-i-helse-og-omsorgstjenesten
 */
function urnToOidType(urn: string, value: string): 'fødselsnummer' | 'd-nummer' | 'annet nummer' {
    switch (urn.replace('urn:oid:', '')) {
        case '2.16.578.1.12.4.1.4.1':
            return 'fødselsnummer'
        case '2.16.578.1.12.4.1.4.2':
            return 'd-nummer'
        default:
            logger.error(`Unknown OID: ${urn}, value: ${value}`)
            return 'annet nummer'
    }
}
