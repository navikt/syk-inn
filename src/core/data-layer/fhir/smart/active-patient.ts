import { headers } from 'next/headers'

export async function getActivePatient(): Promise<string | null> {
    const headersStore = await headers()

    return headersStore.get('FHIR-Active-Patient') ?? null
}
