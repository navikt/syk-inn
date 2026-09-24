import { ReadyClient, SmartClientReadyErrors } from '@navikt/smart-on-fhir/client'

import { getSessionId } from '#core/session/session'
import { getUserlessToggles } from '#core/toggles/unleash'

import { getSmartClient } from './smart-client'

export async function getReadyClient(activePatient: string): Promise<ReadyClient | SmartClientReadyErrors> {
    const actualSessionId = await getSessionId()
    const toggles = await getUserlessToggles()
    const readyClient = await getSmartClient(actualSessionId, activePatient, toggles).ready()

    // ReadyClient errors has higher precedence
    if ('error' in readyClient) return readyClient

    const validToken = await readyClient.validate()
    if (!validToken) return { error: 'INVALID_TOKEN' }

    return readyClient
}
