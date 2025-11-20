import { Page } from '@playwright/test'
import { Scenarios } from '@dev/mock-engine/scenarios/scenarios'

import * as fhirActions from '../../fhir/actions/fhir-user-actions'
import * as standaloneActions from '../../standalone/actions/standalone-user-actions'
import { userInteractionsGroup } from '../../utils/actions'
import { ToggleOverrides } from '../../actions/toggle-overrides'
import { launchMode, Modes } from '../modes'

export function launchAndStart(
    mode: Modes,
    scenario: Scenarios = 'normal',
    toggleOverrides: ToggleOverrides = {},
): (page: Page) => Promise<void> {
    return launchMode(
        mode,
        {
            onFhir: fhirActions.startNewSykmelding({ name: 'Espen Eksempel', fnr: '21037712323' }),
            onStandalone: userInteractionsGroup(
                standaloneActions.searchPerson('21037712323'),
                standaloneActions.startNewSykmelding('21037712323'),
            ),
        },
        scenario,
        toggleOverrides,
    )
}
