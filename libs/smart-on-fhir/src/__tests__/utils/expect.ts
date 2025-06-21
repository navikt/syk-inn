import { expect } from 'vitest'

export function expectHas<T, K extends PropertyKey>(obj: T, key: K): asserts obj is Extract<T, Record<K, unknown>> {
    expect(obj).toHaveProperty(key as unknown as string)
}

export function expectIs<T, A extends unknown[]>(obj: unknown, ctor: abstract new (...args: A) => T): asserts obj is T {
    expect(obj).toBeInstanceOf(ctor)
}

export function searchParamsToObject(url: string): Record<string, string> {
    const searchParams = new URL(url).searchParams
    return Object.fromEntries(new URLSearchParams(searchParams).entries())
}
