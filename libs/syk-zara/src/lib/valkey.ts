import type { GlideClient, HashDataType } from '@valkey/valkey-glide'

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

export function hashToRecord(data: HashDataType): Record<string, string> {
    return Object.fromEntries(data.map(({ field, value }) => [String(field), String(value)]))
}

export async function scanKeys(valkey: GlideClient, match: string, count = 250): Promise<string[]> {
    const keys: string[] = []
    let cursor = '0'

    do {
        const [nextCursor, batch] = await valkey.scan(cursor, { match, count })
        cursor = String(nextCursor)
        keys.push(...batch.map(String))
    } while (cursor !== '0')

    return keys
}
