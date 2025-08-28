import 'server-only'

import * as z from 'zod'
import { logger } from '@navikt/next-logger'
import { teamLogger } from '@navikt/next-logger/team-log'

import { getHelseIdAccessToken, getHelseIdWellKnown } from './helseid-resources'

const HprDetailsSchema = z.object({
    approvals: z.array(
        z.object({
            profession: z.string(),
            authorization: z.object({ value: z.string(), description: z.string() }),
            requisition_rights: z.array(z.object({ value: z.string(), description: z.string() })),
            specialities: z.array(z.unknown()),
        }),
    ),
    hpr_number: z.number().transform((it) => `${it}`),
})

type UserInfo = z.infer<typeof UserInfoSchema>
const UserInfoSchema = z.object({
    name: z.string(),
    'helseid://claims/hpr/hpr_number': z.string(),
    'helseid://claims/hpr/hpr_details': HprDetailsSchema,
})

export async function getHelseIdUserInfo(): Promise<UserInfo | null> {
    const wellKnown = await getHelseIdWellKnown()

    logger.info(`Getting userinfo from: ${wellKnown.userinfo_endpoint}`)
    const response = await fetch(wellKnown.userinfo_endpoint, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${await getHelseIdAccessToken()}`,
        },
        cache: 'no-store',
    })

    if (!response.ok) {
        throw new Error(`Failed to fetch user info: ${response.statusText}`)
    }

    const rawResponse: unknown = await response.json()
    const parsedResponse = UserInfoSchema.safeParse(rawResponse)
    if (!parsedResponse.success) {
        teamLogger.error(await getHelseIdAccessToken())
        teamLogger.error(JSON.stringify(rawResponse, null, 2))
        logger.error(
            new Error(
                `Tried to get /connect/userinfo from HelseID, but something looks wrong and zod parse failed: ${parsedResponse.error.message}`,
                { cause: parsedResponse.error },
            ),
        )
        return null
    }

    return parsedResponse.data
}
