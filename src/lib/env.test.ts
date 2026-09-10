import { beforeAll, beforeEach, describe, expect, test } from 'vitest'

import { getServerEnv } from './env'

describe('getServerEnv', () => {
    beforeAll(() => {
        process.env.HELSEID_URL = 'http://localhost:3000/api/mocks/helseid'
        process.env.SYK_INN_PUBLIC_KEY_JWK = '{}'
        process.env.SYK_INN_PRIVATE_KEY_JWK = '{}'
    })

    beforeEach(() => {
        delete process.env.VALKEY_HOST_SYK_INN
        delete process.env.VALKEY_USERNAME_SYK_INN
        delete process.env.VALKEY_PASSWORD_SYK_INN
    })

    describe('valkeyConfig', () => {
        test('should parse valkeyConfig for local', () => {
            process.env.VALKEY_HOST_SYK_INN = 'foo'
            process.env.VALKEY_PORT_SYK_INN = '6969'

            const env = getServerEnv()

            expect(env.valkey).toEqual({
                host: 'foo',
                port: 6969,
                username: undefined,
                password: undefined,
                tls: false,
            })
        })

        test('should parse valkeyConfig for dev', () => {
            process.env.VALKEY_URI_SYK_INN = 'ya'
            process.env.VALKEY_HOST_SYK_INN = 'foo'
            process.env.VALKEY_USERNAME_SYK_INN = 'bar'
            process.env.VALKEY_PASSWORD_SYK_INN = 'baz'
            process.env.VALKEY_PORT_SYK_INN = '1234'

            const env = getServerEnv()

            expect(env.valkey).toEqual({
                host: 'foo',
                port: 1234,
                username: 'bar',
                password: 'baz',
                tls: true,
            })
        })

        test('should parse valkeyConfig for prod', () => {
            process.env.VALKEY_URI_SYK_INN = 'ya'
            process.env.VALKEY_HOST_SYK_INN = 'foo'
            process.env.VALKEY_USERNAME_SYK_INN = 'bar'
            process.env.VALKEY_PASSWORD_SYK_INN = 'baz'
            process.env.VALKEY_PORT_SYK_INN = '1234'

            const env = getServerEnv()

            expect(env.valkey).toEqual({
                host: 'foo',
                port: 1234,
                username: 'bar',
                password: 'baz',
                tls: true,
            })
        })
    })
})
