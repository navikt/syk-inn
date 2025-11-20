import { Page } from '@playwright/test'
import { Scenarios } from '@dev/mock-engine/scenarios/scenarios'

import { launchWithMock as launchFhirWithMock } from '../fhir/actions/fhir-actions'
import { launchWithMock as launchStandaloneWithMock } from '../standalone/actions/standalone-actions'
import { ToggleOverrides } from '../actions/toggle-overrides'

export type Modes = 'FHIR' | 'Standalone'

export const modes: { mode: Modes }[] = [
    {
        mode: 'FHIR',
    },
    {
        mode: 'Standalone',
    },
]

export function launchMode(
    mode: Modes,
    pre: { onFhir: (page: Page) => Promise<void>; onStandalone: (page: Page) => Promise<void> } | 'noop',
    scenario: Scenarios,
    toggleOverrides: ToggleOverrides = {},
) {
    return async (page: Page): Promise<void> => {
        switch (mode) {
            case 'FHIR':
                await launchFhirWithMock(scenario, toggleOverrides)(page)
                if (pre !== 'noop') await pre.onFhir(page)
                break
            case 'Standalone':
                await launchStandaloneWithMock(scenario, toggleOverrides)(page)
                if (pre !== 'noop') await pre.onStandalone(page)
                break
        }
    }
}

export function onMode(
    mode: Modes,
    on: { fhir: (page: Page) => Promise<void>; standalone: (page: Page) => Promise<void> },
) {
    return async (page: Page): Promise<void> => {
        switch (mode) {
            case 'FHIR':
                await on.fhir(page)
                break
            case 'Standalone':
                await on.standalone(page)
                break
        }
    }
}
