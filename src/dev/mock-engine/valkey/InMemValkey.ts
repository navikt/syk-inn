// oxlint-disable typescript/no-non-null-assertion

import type { GlideClient, HashDataType } from '@valkey/valkey-glide'

import { hashToRecord, toHashData } from '#core/services/valkey/utils'

type HashInput = HashDataType | Record<string, string>

function asRecord(input: HashInput): Record<string, string> {
    return Array.isArray(input) ? hashToRecord(input) : input
}

/**
 * A very dumb in-memory implementation of the subset of glide's `GlideClient` that we actually use. Used by
 * the mock engine (demo/e2e) so that we don't need a running Valkey.
 *
 * It mirrors glide's return types (e.g. `sismember` returns a boolean, `hgetall` returns field/value pairs),
 * so that code written against this behaves identically against a real Valkey.
 */
export function createInMemoryValkey(): GlideClient {
    const hashes = new Map<string, Record<string, string>>()
    const sets = new Map<string, Set<string>>()

    return new Proxy<GlideClient>({} as GlideClient, {
        get(target, prop: string) {
            if (prop === 'then') return target

            switch (prop) {
                case 'hset':
                    return async (key: string, fieldsAndValues: HashInput) => {
                        const values = asRecord(fieldsAndValues)
                        hashes.set(key, { ...hashes.get(key), ...values })
                        return Object.keys(values).length
                    }
                case 'hget':
                    return async (key: string, field: string) => hashes.get(key)?.[field] ?? null
                case 'hmget':
                    return async (key: string, fields: string[]) => {
                        const hash = hashes.get(key)
                        return fields.map((field) => hash?.[field] ?? null)
                    }
                case 'hgetall':
                    return async (key: string): Promise<HashDataType> => toHashData(hashes.get(key) ?? {})
                case 'sadd':
                    return async (key: string, members: string[]) => {
                        const set = sets.get(key) ?? new Set<string>()
                        sets.set(key, set)

                        const before = set.size
                        members.forEach((member) => set.add(member))
                        return set.size - before
                    }
                case 'srem':
                    return async (key: string, members: string[]) => {
                        const set = sets.get(key)
                        if (!set) return 0

                        const before = set.size
                        members.forEach((member) => set.delete(member))
                        return before - set.size
                    }
                case 'sismember':
                    return async (key: string, member: string) => sets.get(key)?.has(member) ?? false
                case 'smembers':
                    return async (key: string) => new Set(sets.get(key) ?? [])
                case 'exists':
                    return async (keys: string[]) => keys.filter((key) => hashes.has(key) || sets.has(key)).length
                case 'del':
                case 'unlink':
                    return async (keys: string[]) =>
                        keys.filter((key) => {
                            const deletedHash = hashes.delete(key)
                            const deletedSet = sets.delete(key)
                            return deletedHash || deletedSet
                        }).length
                case 'expire':
                    return async (key: string) => hashes.has(key) || sets.has(key)
                case 'close':
                    return () => {
                        hashes.clear()
                        sets.clear()
                    }
                default:
                    return () => {
                        throw new Error(`Method ${prop} not implemented in in-memory valkey`)
                    }
            }
        },
    })
}
