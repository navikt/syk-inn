export function raise(messageOrError: string | Error): never {
    if (messageOrError instanceof Error) {
        throw messageOrError
    } else {
        throw new Error(messageOrError)
    }
}
