import { z } from 'zod'
import { logger } from '@navikt/next-logger'

import { isE2E, isLocalOrDemo } from '@utils/env'
import { wait } from '@utils/wait'
import { sykInnApiService } from '@services/syk-inn-api/SykInnApiService'
import { NySykmelding, SubmitSykmeldingFormValuesSchema } from '@services/syk-inn-api/SykInnApiSchema'
import { raise } from '@utils/ts'
import { ensureValidFhirAuth } from '@fhir/auth/verify'

const SubmitSykmeldingPayloadSchema = z.object({
    values: SubmitSykmeldingFormValuesSchema,
    // TODO: Should be retrieved from context/session?
    behandlerHpr: z.string(),
})

type SubmitResult = NySykmelding | { errors: { message: string } }[]

export async function POST(request: Request): Promise<Response> {
    const authStatus = await ensureValidFhirAuth()
    if (authStatus !== 'ok') {
        return authStatus
    }

    const verifiedPayload = SubmitSykmeldingPayloadSchema.safeParse(await request.json())
    if (!verifiedPayload.success) {
        logger.error(`Invalid payload: ${JSON.stringify(verifiedPayload.error, null, 2)}`)

        return Response.json([{ errors: { message: 'Invalid payload' } }] satisfies SubmitResult)
    }

    if (isLocalOrDemo || isE2E) {
        logger.warn(
            `Is in demo, local or e2e, submitting send sykmelding values ${JSON.stringify(verifiedPayload.data, null, 2)}`,
        )
        return await handleMockedRoute()
    }

    const result = await sykInnApiService.createNewSykmelding({
        pasientFnr: verifiedPayload.data.values.pasient ?? raise('SecureFhir did not provide pasient'),
        sykmelderHpr: verifiedPayload.data.behandlerHpr,
        sykmelding: {
            hoveddiagnose: {
                system: verifiedPayload.data.values.diagnoser.hoved.system,
                code: verifiedPayload.data.values.diagnoser.hoved.code,
            },
            aktivitet: verifiedPayload.data.values.aktivitet,
        },
    })

    if ('errorType' in result) {
        return Response.json(
            [{ errors: { message: `Sykmelding creation failed: ${result.errorType}` } }] satisfies SubmitResult,
            { status: 400 },
        )
    }

    return Response.json({ sykmeldingId: result.sykmeldingId } satisfies SubmitResult)
}

async function handleMockedRoute(): Promise<Response> {
    // Fake dev loading
    await wait(1000, 500)

    return Response.json({ sykmeldingId: 'ba78036d-b63c-4c5a-b3d5-b1d1f812da8d' } satisfies SubmitResult)
}
