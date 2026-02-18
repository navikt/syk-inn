const getParts = (version: `${number}.${number}`): [number, number] => {
    const [major, minor] = version.split('.').map(Number)
    return [major, minor]
}

const isStale = (acceptedVersion: `${number}.${number}`, codeVersion: `${number}.${number}`): boolean => {
    const [currentMajor] = getParts(acceptedVersion)
    const [latestMajor] = getParts(codeVersion)
    return latestMajor > currentMajor
}

const relative = (
    acceptedVersion: `${number}.${number}`,
    codeVersion: `${number}.${number}`,
): 'newer' | 'same' | 'older' => {
    if (acceptedVersion === codeVersion) return 'same'

    const [acceptedMajor, acceptedMinor] = getParts(acceptedVersion)
    const [codeMajor, codeMinor] = getParts(codeVersion)

    if (codeMajor > acceptedMajor) return 'newer'
    if (codeMajor < acceptedMajor) return 'older'

    if (codeMinor > acceptedMinor) return 'newer'
    if (codeMinor < acceptedMinor) return 'older'

    return 'same'
}

export const versionUtils = { isStale, relative }
