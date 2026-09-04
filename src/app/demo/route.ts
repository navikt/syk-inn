import { notFound, redirect } from 'next/navigation'

import { createFhirScenarioUrl } from '#dev/tools/scenarios/scenario-url-utils'
import { isDemo, isLocal } from '#lib/env'

export function GET(): void {
    if (!(isLocal && isDemo)) {
        notFound()
    }

    redirect(createFhirScenarioUrl('demo', 'Espen Eksempel', 'Magnar Koman', 'Magnar Legekontor', false))
}
