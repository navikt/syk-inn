import { logger } from '@navikt/next-logger'
import { GeneralIdentifier, Name } from '@navikt/smart-on-fhir/zod'

import { OID_DNR, OID_FNR, OID_HPR } from './oids'

export function getNameFromFhir(name: Name): string | { error: 'NO_NAME' } {
    if (name == null || name.length === 0) {
        return { error: 'NO_NAME' }
    }

    return `${name[0].given[0]} ${name[0].family}`
}

/**
 * An "ident" is a Norwegian national identifier, either a FNR (fødselsnummer) or DNR (D-nummer).
 */
export function getIdentFromFhir(
    identifier: GeneralIdentifier[] | null | undefined,
): string | { error: 'NO_IDENTIFIER' | 'NO_FNR_DNR'; details: string } {
    if (identifier == null) {
        return { error: 'NO_IDENTIFIER', details: 'Identifier is null' }
    }

    const oids = identifier.filter((id) => id.system.startsWith('urn:oid'))
    if (oids.length === 0) {
        return { error: 'NO_IDENTIFIER', details: 'No OID identifiers found' }
    }

    const oidsByType = oids.map((it) => ({
        type: userUrnToOidType(it.system),
        nr: it.value,
    }))

    if (!oidsByType.find((oid) => ['fnr', 'dnr'].includes(oid.type))) {
        return {
            error: 'NO_FNR_DNR',
            details: `Found no FNR/DNR oids, only ${oidsByType.map((oid) => oid.type).join(', ')}`,
        }
    }

    const fnr = oidsByType.find((oid) => oid.type === 'fnr')
    if (fnr != null) {
        return fnr.nr
    }

    const dnr = oidsByType.find((oid) => oid.type === 'dnr')
    if (dnr != null) {
        return dnr.nr
    }

    return {
        error: 'NO_FNR_DNR',
        details: `Found no FNR/DNR oids, only ${oidsByType.map((oid) => oid.type).join(', ')}`,
    }
}

export function getHprFromFhir(
    identifier: GeneralIdentifier[],
): string | { error: 'NO_IDENTIFIER' | 'NO_HPR'; details: string } {
    if (identifier == null) {
        return { error: 'NO_IDENTIFIER', details: 'Identifier is null' }
    }

    const oids = identifier.filter((id) => id.system.startsWith('urn:oid'))
    if (oids.length === 0) {
        return { error: 'NO_IDENTIFIER', details: 'No OID identifiers found' }
    }

    const hprIdentifier = oids.find((id) => userUrnToOidType(id.system) === 'hpr')
    if (hprIdentifier == null) {
        return { error: 'NO_HPR', details: 'No HPR identifier found' }
    }

    return hprIdentifier.value
}

export function isValidIdent(
    ident: ReturnType<typeof getHprFromFhir> | ReturnType<typeof getIdentFromFhir>,
): ident is string {
    return typeof ident === 'string'
}

export function isValidName(name: ReturnType<typeof getNameFromFhir>): name is string {
    return typeof name === 'string'
}

/**
 * Kilde: https://www.ehelse.no/teknisk-dokumentasjon/oid-identifikatorserier-i-helse-og-omsorgstjenesten
 */
function userUrnToOidType(urn: string): 'fnr' | 'dnr' | 'hpr' | 'annet' {
    switch (urn.replace('urn:oid:', '')) {
        case OID_FNR:
            return 'fnr'
        case OID_DNR:
            return 'dnr'
        case OID_HPR:
            return 'hpr'
        default:
            logger.error(`Unknown OID: ${urn}`)
            return 'annet'
    }
}
