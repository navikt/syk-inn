import { describe, it, expect } from 'vitest'

import { versionUtils } from './utils'

describe('isStale', () => {
    it('is stale when major increases', () => {
        expect(versionUtils.isStale('1.1', '2.0')).toBe(true)
    })

    it('is not stale when only minor increases', () => {
        expect(versionUtils.isStale('2.0', '2.1')).toBe(false)
    })

    it('is not stale when versions are equal', () => {
        expect(versionUtils.isStale('3.2', '3.2')).toBe(false)
    })

    it('is not stale when latest has lower major', () => {
        expect(versionUtils.isStale('3.0', '2.9')).toBe(false)
    })

    it('is stale regardless of minor when major increases', () => {
        expect(versionUtils.isStale('1.9', '2.9')).toBe(true)
    })
})

describe('relative', () => {
    it('is newer when major increases', () => {
        expect(versionUtils.relative('1.1', '2.0')).toBe('newer')
    })

    it('is newer when minor increases', () => {
        expect(versionUtils.relative('2.0', '2.1')).toBe('newer')
    })

    it('is not newer when versions are equal', () => {
        expect(versionUtils.relative('3.2', '3.2')).toBe('same')
    })

    it('is not newer when latest has lower major', () => {
        expect(versionUtils.relative('3.0', '2.9')).toBe('older')
    })

    it('is newer regardless of minor when major increases', () => {
        expect(versionUtils.relative('1.9', '2.9')).toBe('newer')
    })
})
