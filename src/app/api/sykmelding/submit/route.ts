import { z } from 'zod'
import { logger } from '@navikt/next-logger'

import { DateOnly } from '@utils/zod'
import { isE2E, isLocalOrDemo } from '@utils/env'
import { wait } from '@utils/wait'
import { createNewSykmelding } from '@services/SykInnApiService'
import { raise } from '@utils/ts'

const SubmitSykmeldingFormValuesSchema = z.object({
    pasient: z.string().optional(),
    diagnoser: z.object({
        hoved: z.object({
            system: z.union([z.literal('ICD10'), z.literal('ICPC2')]),
            code: z.string(),
        }),
    }),
    aktivitet: z.discriminatedUnion('type', [
        z.object({
            type: z.literal('AKTIVITET_IKKE_MULIG'),
            fom: DateOnly,
            tom: DateOnly,
        }),
        z.object({
            type: z.literal('GRADERT'),
            fom: DateOnly,
            tom: DateOnly,
            grad: z
                .string()
                .transform((it) => +it)
                .pipe(z.number().min(1).max(99)),
        }),
    ]),
})

const SubmitSykmeldingPayloadSchema = z.object({
    values: SubmitSykmeldingFormValuesSchema,
    // TODO: Should be retrieved from context/session?
    behandlerHpr: z.string(),
})

type SubmitResult = { ok: 'ok'; id: string } | { errors: { message: string } }[]

export async function POST(request: Request): Promise<Response> {
    const verifiedPayload = SubmitSykmeldingPayloadSchema.safeParse(await request.json())
    if (!verifiedPayload.success) {
        logger.error(`Invalid payload: ${JSON.stringify(verifiedPayload.error, null, 2)}`)

        return Response.json([{ errors: { message: 'Invalid payload' } }] satisfies SubmitResult)
    }

    if (isLocalOrDemo || isE2E) {
        logger.info(`Submitting values ${JSON.stringify(verifiedPayload.data, null, 2)}`)

        // Fake dev loading
        await wait(5000, 2000)

        return Response.json({ ok: 'ok', id: 'ba78036d-b63c-4c5a-b3d5-b1d1f812da8d' } satisfies SubmitResult)
    }

    const result = await createNewSykmelding({
        // TODO: Get from context, TODO-2, maybe not? Form provides using hidden inputs
        pasientFnr: verifiedPayload.data.values.pasient ?? raise('TODO: Pasient from context is not supported yet'),
        sykmelderHpr: verifiedPayload.data.behandlerHpr,
        sykmelding: {
            hoveddiagnose: {
                system: verifiedPayload.data.values.diagnoser.hoved.system,
                code: verifiedPayload.data.values.diagnoser.hoved.code,
            },
            aktivitet: verifiedPayload.data.values.aktivitet,
        },
    })

    if (result !== 'ok') {
        return Response.json([
            { errors: { message: `Sykmelding creation failed: ${result.errorType}` } },
        ] satisfies SubmitResult)
    }

    // TODO(3): Redirect to /<mode>/sykmelding/<id> (how to get mode?)
    return Response.json({ ok: 'ok', id: 'ba78036d-b63c-4c5a-b3d5-b1d1f812da8d' } satisfies SubmitResult)
}
