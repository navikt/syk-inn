import { logger } from '@navikt/next-logger'

export const OID_FNR = '2.16.578.1.12.4.1.4.1'
export const OID_DNR = '2.16.578.1.12.4.1.4.2'
export const OID_HPR = '2.16.578.1.12.4.1.4.4'

/**
 * Kilde: https://www.ehelse.no/teknisk-dokumentasjon/oid-identifikatorserier-i-helse-og-omsorgstjenesten
 */
export function userUrnToOidType(urn: string): 'fnr' | 'dnr' | 'hpr' | 'annet' {
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
