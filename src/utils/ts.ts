/**
 * This function can be used to be able to throw an error as an expression. For example
 * as the fallback value in with a ?? operator.
 */
export function raise(messageOrError: string | Error): never {
    if (messageOrError instanceof Error) {
        throw messageOrError
    } else {
        throw new Error(messageOrError)
    }
}

export type KeysOfUnion<T> = T extends T ? keyof T : never

export type NonNullableObject<T> = {
    [P in keyof T]: NonNullable<T[P]>
}
