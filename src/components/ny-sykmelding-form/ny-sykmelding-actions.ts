'use server'

import { logger } from '@navikt/next-logger'

import { wait } from '@utils/wait'
import { createNewSykmelding } from '@services/SykInnApiService'

import { NySykmeldingFormValues } from './NySykmeldingFormValues'

export async function createSykmelding(
    values: NySykmeldingFormValues,
): Promise<{ ok: 'ok'; id: string } | { errors: { message: string } }[]> {
    /* TODO(1): Verify token:

       FHIR: Server side validation towards the FHIR/.well-known server. This requires the login-flow to at some point
             store some server side state, and the token to be passed to the server.

       Standalone: Server side validation against HelseID/.well-known. This is known.
     */

    // Fake dev loading
    await wait(5000)

    logger.info(`Submitting values ${JSON.stringify(values, null, 2)}`)

    // TODO(2): Validate payload (zod?)
    // TODO(3): Exchange token: Exchange to nais M2M token, and call API using service discovery
    const result = await createNewSykmelding({
        // TODO: Get from context
        pasientFnr: '12345678901',
        sykmelderHpr: '1234567',
        sykmelding: {
            hoveddiagnose: {
                system: values.diagnoser.hoved!.system,
                code: values.diagnoser.hoved!.code,
            },
            aktivitet: {
                type: 'AKTIVITET_IKKE_MULIG',
                fom: values.aktivitet.fom!,
                tom: values.aktivitet.tom!,
            },
        },
    })

    if (result !== 'ok') {
        return [{ errors: { message: `Sykmelding creation failed: ${result.errorType}` } }]
    }

    // TODO(4): Redirect to /<mode>/sykmelding/<id> (how to get mode?)

    return { ok: 'ok', id: 'ba78036d-b63c-4c5a-b3d5-b1d1f812da8d' }
}
