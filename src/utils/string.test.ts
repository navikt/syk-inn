import { describe, expect, test } from 'vitest'

import { cleanId } from './string'

describe('cleanId', () => {
    test('should handle a bunch of scenarios', () => {
        expect(cleanId('Hello I Am Big string')).toEqual('hello-i-am-big-string')
        expect(cleanId('Geez (Loise) 123')).toEqual('geez-loise-123')
        expect(cleanId('https://why-would-you-use-an-url-as-id.com/haha%20oki')).toEqual(
            'httpswhy-would-you-use-an-url-as-idcomhaha20oki',
        )
    })
})
