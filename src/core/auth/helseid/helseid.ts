import { logger } from '@navikt/next-logger'
import { decodeJwt } from 'jose'

import { failSpan, spanServerAsync } from '#lib/otel/server'

import { HelseIdIdToken, HelseIdIdTokenSchema, UserInfo, UserInfoSchema } from './schema'
import { getHelseIdWellKnown } from './token/well-known'
import { getWonderwallHelseIdAccessToken, getWonderwallHelseIdIdToken } from './wonderwall-tokens'

type HelseIdBehandler = {
    /**
     * Null if logged in with HelseID, but not a healthcare professional (behandler).
     */
    hpr: string | null
    navn: string
}

/**
 * Decodes the currently logged in behandlers HelseID ID-token.
 */
export async function getHelseIdBehandler(): Promise<HelseIdBehandler | null> {
    return spanServerAsync('HelseID.getHelseIdBehandler', async (span) => {
        try {
            const tokenPayload = await decodeHelseIdIdToken()

            return {
                hpr: tokenPayload['helseid://claims/hpr/hpr_number'] ?? null,
                navn: tokenPayload.name,
            }
        } catch (e) {
            failSpan(span, 'Failed to get HelseID behandler', e as Error)

            return null
        }
    })
}

/**
 * Requests all details about the currently logged in user directly from HelseID using
 * the user_info endpoint. This is an additional request.
 */
export async function fetchHelseIdUserInfo(): Promise<UserInfo | null> {
    return spanServerAsync('HelseID.getHelseIdUserInfo', async () => {
        const wellKnown = await getHelseIdWellKnown()

        logger.info(`Getting userinfo from: ${wellKnown.userinfo_endpoint}`)
        const response = await fetch(wellKnown.userinfo_endpoint, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${await getWonderwallHelseIdAccessToken()}`,
            },
            cache: 'no-store',
        })

        if (!response.ok) {
            throw new Error(`Failed to fetch user info: ${response.statusText}`)
        }

        const rawResponse: unknown = await response.json()
        const parsedResponse = UserInfoSchema.safeParse(rawResponse)
        if (!parsedResponse.success) {
            logger.error(
                new Error(
                    `Tried to get /connect/userinfo from HelseID, but something looks wrong and zod parse failed: ${parsedResponse.error.message}`,
                    { cause: parsedResponse.error },
                ),
            )
            return null
        }

        return parsedResponse.data
    })
}

export async function decodeHelseIdIdToken(): Promise<HelseIdIdToken> {
    return spanServerAsync('HelseID.getHelseIdIdTokenInfo', async () => {
        const idToken = await getWonderwallHelseIdIdToken()

        return HelseIdIdTokenSchema.parse(decodeJwt(idToken))
    })
}
