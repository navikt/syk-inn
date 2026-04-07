import { describe, expect, test } from 'vitest'

import { searchDiagnose } from '@data-layer/common/diagnose-search'

describe('diagnose search', () => {
    test('should only return 100 max', () => {
        const diagnosis = searchDiagnose('ha', ['ICPC2', 'ICPC2B'])

        expect(diagnosis.length).toBe(100)
    })

    test('should return specific diagnosis by code', () => {
        const diagnosis = searchDiagnose('Y06', ['ICPC2', 'ICPC2B'])

        expect(diagnosis.length).toBe(4)
        expect(diagnosis[0].code).toEqual('Y06')
        expect(diagnosis[1].code).toEqual('Y06.0000')
        expect(diagnosis[2].code).toEqual('Y06.0001')
        expect(diagnosis[3].code).toEqual('Y06.0002')
    })
})
