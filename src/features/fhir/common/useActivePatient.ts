import { useParams } from 'next/navigation'

import { raise } from '@lib/ts'

export function useActivePatient(): string {
    const params = useParams<{ patientId: string | undefined }>()

    if (!params.patientId) {
        raise('Attempted to use useActivePatient outside of a route under [patientId]')
    }

    return params.patientId
}
