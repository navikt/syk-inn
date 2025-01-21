export function cleanPath(url: string): string {
    return url.replace(/.*\/mocks\/fhir/, '')
}
