export function assertNotBrowser(): void {
    if (typeof window !== 'undefined') {
        throw new Error(
            'Oops! You seem to have bundled @navikt/smart-on-fhir in your browser. This library is server-side only. Please make sure you are using this library properly.',
        )
    }
}

export function removeTrailingSlash(url: string): string {
    return url.replace(/\/$/, '')
}

export async function getResponseError(response: Response): Promise<string> {
    if (response.headers.get('Content-Type')?.includes('text/plain')) {
        return await response.text()
    } else if (response.headers.get('Content-Type')?.includes('application/json')) {
        const json = await response.json()
        return JSON.stringify(json, null, 2)
    } else {
        return `Unknown error (content-type was: ${response.headers.get('Content-Type')})`
    }
}
