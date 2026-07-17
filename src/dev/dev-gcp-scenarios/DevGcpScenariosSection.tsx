import React, { ReactElement } from 'react'

import { PreviousPatientsList } from './PreviousPatientsList'
import { SykepengesoknadScenarios } from './SykepengesoknadScenarios'

interface Props {
    search: (ident: string) => Promise<void>
}

export function DevGcpScenariosSection({ search }: Props): ReactElement {
    return (
        <div className="bg-ax-bg-default p-4 rounded-xl">
            <PreviousPatientsList search={search} />
            <SykepengesoknadScenarios />
        </div>
    )
}
