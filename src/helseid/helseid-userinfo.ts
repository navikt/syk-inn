import 'server-only'

import { z } from 'zod'
import { logger } from '@navikt/next-logger'

import { getHelseIdAccessToken, getHelseIdWellKnown } from './helseid-resources'

export type HprDetails = z.infer<typeof HprDetailsSchema>
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

export const UserInfoSchema = z.object({
    'helseid://claims/hpr/hpr_details': HprDetailsSchema,
})

export async function getHelseIdUserInfo(): Promise<HprDetails | null> {
    const wellKnown = await getHelseIdWellKnown()
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

    const parsedResponse = UserInfoSchema.safeParse(await response.json())
    if (!parsedResponse.success) {
        logger.error(
            new Error(
                `Tried to get /connect/userinfo from HelseID, but something looks wrong and zod parse failed: ${parsedResponse.error.message}`,
                { cause: parsedResponse.error },
            ),
        )
        return null
    }

    return parsedResponse.data['helseid://claims/hpr/hpr_details']
}
