import { ReadyClient, SmartClientReadyErrors } from '@navikt/smart-on-fhir/client'
import { logger } from '@navikt/next-logger'

import { getActivePatient } from '@data-layer/fhir/smart/active-patient'

import { HelseIdClaimSchema } from './helseid'
import { getSmartClient } from './smart-client'
import { getSessionId } from './session'

export async function getReadyClient(opts: { validate: true }): Promise<ReadyClient | SmartClientReadyErrors> {
    const actualSessionId = await getSessionId()
    const activePatient = await getActivePatient()
    const readyClient = await getSmartClient(actualSessionId, activePatient).ready()

    if (opts?.validate) {
        const validToken = await readyClient.validate()
        if (!validToken) {
            return { error: 'INVALID_TOKEN' }
        }
    }

    return readyClient
}

export async function shadowVerifyHelseIdOnFhir(client: ReadyClient): Promise<void> {
    try {
        const helseIdClaim = client.getClaim('https://helseid.nhn.no', HelseIdClaimSchema)

        if ('error' in helseIdClaim) {
            logger.warn(
                `Smart session was attempted to be launched with HelseID claim, but client says: ${helseIdClaim.error}`,
            )
        } else {
            logger.info(
                `Smart session is launched with HelseID claim, and access_token of length ${helseIdClaim.access_token.length} was found`,
            )
        }
    } catch (e) {
        logger.warn(
            new Error(
                'HelseID token validation is only in proof-of-concept mode, this is expected in demo/local, ignoring claim error',
                { cause: e },
            ),
        )
    }
}
