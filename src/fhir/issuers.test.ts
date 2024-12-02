import { describe, it, expect } from 'vitest'

import { isKnownIssuer } from './issuers'

describe('isKnownIssuer', () => {
    it('should return true for known issuer', () => {
        expect(isKnownIssuer('http://localhost:3000/api/mocks/fhir')).toBe(true)
    })

    it('should return true for known issuer, even with trailing slash', () => {
        expect(isKnownIssuer('http://localhost:3000/api/mocks/fhir/')).toBe(true)
    })

    it('should return false for unknown issuer', () => {
        expect(isKnownIssuer('http://example.com/fhir')).toBe(false)
    })

    it('should ignore params (and trailing slash)', () => {
        expect(isKnownIssuer('http://localhost:3000/api/mocks/fhir/?launch=mordi')).toBe(true)
    })
})
