'use server'

import { logger } from '@navikt/next-logger'
import { z } from 'zod'

import { wait } from '@utils/wait'
import { isE2E, isLocalOrDemo } from '@utils/env'
import { createNewSykmelding } from '@services/SykInnApiService'
import { DateOnly } from '@utils/zod'
import { raise } from '@utils/ts'

import { NySykmeldingFormValues } from './NySykmeldingFormValues'

const CreateSykmeldingSchema = z.object({
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

export async function createSykmelding(
    values: NySykmeldingFormValues,
    behandler: { hpr: string },
): Promise<{ ok: 'ok'; id: string } | { errors: { message: string } }[]> {
    const verifiedPayload = CreateSykmeldingSchema.safeParse(values)
    if (!verifiedPayload.success) {
        logger.error(`Invalid payload: ${JSON.stringify(verifiedPayload.error, null, 2)}`)

        return [{ errors: { message: 'Invalid payload' } }]
    }

    if (isLocalOrDemo || isE2E) {
        logger.info(`Submitting values ${JSON.stringify(verifiedPayload.data, null, 2)}`)

        // Fake dev loading
        await wait(5000, 2000)

        return { ok: 'ok', id: 'ba78036d-b63c-4c5a-b3d5-b1d1f812da8d' }
    }

    /* TODO(1): Verify token:

       FHIR: Server side validation towards the FHIR/.well-known server. This requires the login-flow to at some point
             store some server side state, and the token to be passed to the server.

       Standalone: Server side validation against HelseID/.well-known. This is known.
     */

    const result = await createNewSykmelding({
        // TODO: Get from context
        pasientFnr: verifiedPayload.data.pasient ?? raise('TODO: Pasient from context is not supported yet'),
        sykmelderHpr: behandler.hpr,
        sykmelding: {
            hoveddiagnose: {
                system: verifiedPayload.data.diagnoser.hoved.system,
                code: verifiedPayload.data.diagnoser.hoved.code,
            },
            aktivitet: verifiedPayload.data.aktivitet,
        },
    })

    if (result !== 'ok') {
        return [{ errors: { message: `Sykmelding creation failed: ${result.errorType}` } }]
    }

    // TODO(3): Redirect to /<mode>/sykmelding/<id> (how to get mode?)

    return { ok: 'ok', id: 'ba78036d-b63c-4c5a-b3d5-b1d1f812da8d' }
}
