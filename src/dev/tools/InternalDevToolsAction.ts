'use server'

import { revalidatePath } from 'next/cache'

export async function togglesChangedAction(): Promise<void> {
    revalidatePath('/fhir')
}
