import * as R from 'remeda'

export function booleanOrNullToJaEllerNei(value: boolean | null): 'JA' | 'NEI' | null {
    if (value === null) return null
    return value ? 'JA' : 'NEI'
}

/**
 * Takes an array of potentially nullable values, where the last value cannot be null (unless explicitly typed).
 *
 * Will use the first value in the array that is not null.
 */
export function precedence<Values>(values: [...(Values | null)[], Values]): Values {
    for (const value of values.slice(0, -1)) {
        if (value !== null) {
            return value
        }
    }

    return R.last(values)
}
