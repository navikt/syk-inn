import { logger } from '@navikt/next-logger'
import { NextRequest, NextResponse } from 'next/server'
import * as z from 'zod'

import { getHelseIdBehandler } from '#core/auth/helseid/helseid'
import { acceptBruksvilkar } from '#core/services/bruksvilkar/bruksvilkar-service'
import { bundledEnv } from '#lib/env'

const PayloadSchema = z.object({
    version: z.templateLiteral([z.number(), '.', z.number()]),
})

type ResponsePayload = {
    acceptedAt: string
    version: string
}

export async function PUT(request: NextRequest): Promise<Response> {
    const body = PayloadSchema.parse(await request.json())
    const userInfo = await getHelseIdBehandler()

    if (userInfo == null || userInfo.hpr == null) {
        logger.error('Tried to accept bruksvilkår, got user without HPR')
        return NextResponse.json({ error: 'NO_HPR' }, { status: 401 })
    }

    const accept: ResponsePayload = await acceptBruksvilkar(
        body.version,
        { hpr: userInfo.hpr, name: userInfo.navn, orgnummer: null },
        { system: 'Åpen (HelseID)', commmitHash: bundledEnv.NEXT_PUBLIC_VERSION ?? 'missing' },
    )

    return Response.json(accept)
}
