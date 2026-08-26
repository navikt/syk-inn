import { beforeAll, beforeEach, describe, expect, test } from 'vitest'

import { getServerEnv } from './env'

describe('getServerEnv', () => {
    beforeAll(() => {
        process.env.HELSEID_URL = 'http://localhost:3000/api/mocks/helseid'
    })

    beforeEach(() => {
        delete process.env.VALKEY_HOST_SYK_INN
        delete process.env.VALKEY_USERNAME_SYK_INN
        delete process.env.VALKEY_PASSWORD_SYK_INN
    })

    describe('valkeyConfig', () => {
        test('should parse valkeyConfig for local', () => {
            process.env.VALKEY_HOST_SYK_INN = 'foo'

            const env = getServerEnv()

            expect(env.valkey).toEqual({
                host: 'foo',
            })
        })

        test('should parse valkeyConfig for dev', () => {
            process.env.VALKEY_HOST_SYK_INN = 'foo'
            process.env.VALKEY_USERNAME_SYK_INN = 'bar'
            process.env.VALKEY_PASSWORD_SYK_INN = 'baz'
            process.env.VALKEY_PORT_SYK_INN = '1234'

            const env = getServerEnv()

            expect(env.valkey).toEqual({
                tls: {
                    host: 'foo',
                    port: 1234,
                },
                username: 'bar',
                password: 'baz',
            })
        })

        test('should parse valkeyConfig for prod', () => {
            process.env.VALKEY_HOST_SYK_INN = 'foo'
            process.env.VALKEY_USERNAME_SYK_INN = 'bar'
            process.env.VALKEY_PASSWORD_SYK_INN = 'baz'
            process.env.VALKEY_PORT_SYK_INN = '1234'

            const env = getServerEnv()

            expect(env.valkey).toEqual({
                tls: {
                    host: 'foo',
                    port: 1234,
                },
                username: 'bar',
                password: 'baz',
            })
        })

        test('should parse valkeyConfig and throw if prod and missing username/password', () => {
            process.env.NEXT_PUBLIC_RUNTIME_ENV = 'prod-gcp'
            process.env.VALKEY_HOST_SYK_INN = 'foo'
            process.env.VALKEY_PORT_SYK_INN = '1234'

            expect(() => getServerEnv()).toThrowErrorMatchingSnapshot()
        })
    })
})
