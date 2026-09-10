import type { HashDataType } from '@valkey/valkey-glide'

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
