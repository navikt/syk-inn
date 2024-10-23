import { beforeEach, describe, test, expect } from 'vitest'

import { getServerEnv } from './env'

describe('getServerEnv', () => {
    beforeEach(() => {
        delete process.env.REDIS_URI_SYK_INN
        delete process.env.REDIS_USERNAME_SYK_INN
        delete process.env.REDIS_PASSWORD_SYK_INN
    })

    describe('redisConfig', () => {
        test('should parse redisConfig for local', () => {
            process.env.REDIS_URI_SYK_INN = 'foo'

            const env = getServerEnv()

            expect(env.redisConfig).toEqual({
                runtimeEnv: 'local',
                url: 'foo',
            })
        })

        test('should parse redisConfig for dev', () => {
            process.env.NEXT_PUBLIC_RUNTIME_ENV = 'dev-gcp'
            process.env.REDIS_URI_SYK_INN = 'foo'
            process.env.REDIS_USERNAME_SYK_INN = 'bar'
            process.env.REDIS_PASSWORD_SYK_INN = 'baz'

            const env = getServerEnv()

            expect(env.redisConfig).toEqual({
                runtimeEnv: 'dev-gcp',
                url: 'foo',
                username: 'bar',
                password: 'baz',
            })
        })

        test('should parse redisConfig for prod', () => {
            process.env.NEXT_PUBLIC_RUNTIME_ENV = 'prod-gcp'
            process.env.REDIS_URI_SYK_INN = 'foo'
            process.env.REDIS_USERNAME_SYK_INN = 'bar'
            process.env.REDIS_PASSWORD_SYK_INN = 'baz'

            const env = getServerEnv()

            expect(env.redisConfig).toEqual({
                runtimeEnv: 'prod-gcp',
                url: 'foo',
                username: 'bar',
                password: 'baz',
            })
        })

        test('should parse redisConfig and throw if prod and missing username/password', () => {
            process.env.NEXT_PUBLIC_RUNTIME_ENV = 'prod-gcp'
            process.env.REDIS_URI_SYK_INN = 'foo'

            expect(() => getServerEnv()).toThrowErrorMatchingSnapshot()
        })
    })
})
