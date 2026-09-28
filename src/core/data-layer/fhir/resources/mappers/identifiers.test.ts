import { expect, test, describe } from 'vitest'

import { getNameFromFhir, getIdentFromFhir, getHprFromFhir } from './identifiers'
import { OID_FNR, OID_DNR, OID_HPR } from './oids'

const FNR_OID = `urn:oid:${OID_FNR}`
const DNR_OID = `urn:oid:${OID_DNR}`
const HPR_OID = `urn:oid:${OID_HPR}`

describe('getNameFromFhir', () => {
    test('returns given and family name', () => {
        expect(getNameFromFhir([{ given: ['Ola'], family: 'Nordmann' }])).toBe('Ola Nordmann')
    })

    test('returns error when name is null', () => {
        expect(getNameFromFhir(null as never)).toEqual({ error: 'NO_NAME' })
    })

    test('returns error when name is empty', () => {
        expect(getNameFromFhir([])).toEqual({ error: 'NO_NAME' })
    })
})

describe('getValidPatientIdent', () => {
    test('returns fnr', () => {
        expect(getIdentFromFhir([{ system: FNR_OID, value: '12345678901' }])).toBe('12345678901')
    })

    test('returns dnr when no fnr', () => {
        expect(getIdentFromFhir([{ system: DNR_OID, value: '52345678901' }])).toBe('52345678901')
    })

    test('prefers fnr over dnr', () => {
        expect(
            getIdentFromFhir([
                { system: DNR_OID, value: '52345678901' },
                { system: FNR_OID, value: '12345678901' },
            ]),
        ).toBe('12345678901')
    })

    test('returns error when identifier is null', () => {
        expect(getIdentFromFhir(null as never)).toEqual({
            error: 'NO_IDENTIFIER',
            details: 'Identifier is null',
        })
    })

    test('returns error when no oid identifiers', () => {
        expect(getIdentFromFhir([{ system: 'urn:something:else', value: '123' }])).toEqual({
            error: 'NO_IDENTIFIER',
            details: 'No OID identifiers found',
        })
    })

    test('returns error when only hpr oid', () => {
        expect(getIdentFromFhir([{ system: HPR_OID, value: '123' }])).toEqual({
            error: 'NO_FNR_DNR',
            details: 'Found no FNR/DNR oids, only hpr',
        })
    })
})

describe('getHprFromFhir', () => {
    test('returns hpr', () => {
        expect(getHprFromFhir([{ system: HPR_OID, value: '123' }])).toBe('123')
    })

    test('returns hpr when other oids present', () => {
        expect(
            getHprFromFhir([
                { system: FNR_OID, value: '12345678901' },
                { system: HPR_OID, value: '123' },
            ]),
        ).toBe('123')
    })

    test('returns error when identifier is null', () => {
        expect(getHprFromFhir(null as never)).toEqual({
            error: 'NO_IDENTIFIER',
            details: 'Identifier is null',
        })
    })

    test('returns error when no oid identifiers', () => {
        expect(getHprFromFhir([{ system: 'urn:something:else', value: '123' }])).toEqual({
            error: 'NO_IDENTIFIER',
            details: 'No OID identifiers found',
        })
    })

    test('returns error when no hpr oid', () => {
        expect(getHprFromFhir([{ system: FNR_OID, value: '12345678901' }])).toEqual({
            error: 'NO_HPR',
            details: 'No HPR identifier found',
        })
    })
})
