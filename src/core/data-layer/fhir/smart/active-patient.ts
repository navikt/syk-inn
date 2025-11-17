import { headers } from 'next/headers'

export async function getFhirActivePatient(): Promise<string | null> {
    const headersStore = await headers()

    return headersStore.get('FHIR-Active-Patient') ?? null
}
