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
