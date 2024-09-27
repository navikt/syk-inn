export function raise(messageOrError: string | Error): never {
    if (messageOrError instanceof Error) {
        throw new Error(messageOrError.message)
    } else {
        throw new Error(messageOrError)
    }
}
