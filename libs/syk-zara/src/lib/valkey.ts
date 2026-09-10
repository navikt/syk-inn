import type { GlideClient, HashDataType } from '@valkey/valkey-glide'

/**
 * The Valkey client used by every client in this library. Glide multiplexes all commands over a single
 * connection, so a single client instance should be shared across the entire application.
 *
 * The only exception is pub/sub subscriptions, which require a dedicated connection (see ./pubsub/sub.ts).
 */
export type ValkeyClient = GlideClient

/**
 * Glide is strict about what it accepts as hash values (`string | Buffer`), unlike iovalkey which coerced
 * everything with `String(...)`, and `null`/`undefined` into an empty string.
 *
 * We keep that behaviour here so the existing data in Valkey (and the zod schemas reading it, e.g.
 * `NullableValkeyString`) keep working.
 */
export function toHashData(values: Record<string, unknown>): HashDataType {
    return Object.entries(values).map(([field, value]) => ({
        field,
        value: stringifyHashValue(value),
    }))
}

function stringifyHashValue(value: unknown): string {
    if (value == null) return ''
    if (typeof value === 'string') return value

    return String(value as string | number | boolean | bigint)
}

/**
 * Glide returns hashes as a list of field/value pairs, but every consumer (zod schemas etc.) wants a record.
 */
export function hashToRecord(data: HashDataType): Record<string, string> {
    return Object.fromEntries(data.map(({ field, value }) => [String(field), String(value)]))
}

/**
 * `KEYS` is O(N) and blocks the server for the entire duration. `SCAN` is cursor based and only ever blocks
 * for a single batch, so it should always be preferred when iterating the keyspace.
 */
export async function scanKeys(valkey: ValkeyClient, match: string, count = 250): Promise<string[]> {
    const keys: string[] = []
    let cursor = '0'

    do {
        const [nextCursor, batch] = await valkey.scan(cursor, { match, count })
        cursor = String(nextCursor)
        keys.push(...batch.map(String))
    } while (cursor !== '0')

    return keys
}
