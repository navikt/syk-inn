import { raise } from '@utils/ts'

export function getFhirIdTokenFromSessionStorage(): string {
    const smartKey: string = JSON.parse(
        sessionStorage.getItem('SMART_KEY') ?? raise('No SMART_KEY, seems like FHIR session is not launched maybe?'),
    )
    const item = JSON.parse(
        sessionStorage.getItem(smartKey) ?? raise(`No item in session storage for SMART_KEY=${smartKey}`),
    )

    return item.tokenResponse?.id_token ?? raise('No id_token')
}
