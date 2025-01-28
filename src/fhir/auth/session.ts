import { raise } from '@utils/ts'

export function getFhirAccessTokenFromSessionStorage(): string {
    const item = getSmartSession()

    if ('id_token' in item.tokenResponse) {
        return item.tokenResponse.access_token
    }

    raise('No id_token')
}

export function getSmartSession(): FhirSessionType {
    const smartKey: string = JSON.parse(
        sessionStorage.getItem('SMART_KEY') ?? raise('No SMART_KEY, seems like FHIR session is not launched maybe?'),
    )

    return JSON.parse(sessionStorage.getItem(smartKey) ?? raise(`No item in session storage for SMART_KEY=${smartKey}`))
}

export type FhirSessionType = {
    clientId: string
    scope: string
    redirectUri: string
    serverUrl: string
    tokenResponse: { in_token: string } | Record<string, never>
    key: string
    registrationUri: string
    authorizeUri: string
    tokenUri: string
    codeChallengeMethods: Array<string>
    codeChallenge: string
    codeVerifier: string
}
