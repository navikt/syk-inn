import { logger } from '@navikt/next-logger'

import { isE2E, isLocalOrDemo } from '@utils/env'
import { wait } from '@utils/wait'
import { sykInnApiService } from '@services/syk-inn-api/SykInnApiService'
import { raise } from '@utils/ts'
import { diagnoseSystemToOid } from '@utils/oid'
import { getReadyClient } from '@data-layer/fhir/smart-client'
import { submitSykmeldingRoute } from '@data-layer/api-routes/route-handlers'
import { getHpr } from '@data-layer/fhir/mappers/practitioner'
import { CreatedSykmelding } from '@data-layer/resources'

export const POST = submitSykmeldingRoute(async (payload) => {
    const client = await getReadyClient({ validate: true })
    if ('error' in client) {
        return { error: 'AUTH_ERROR' }
    }

    const practitioner = await client.request(`/${client.fhirUser}`)
    if ('error' in practitioner) {
        return { error: 'PARSING_ERROR' }
    }

    const hpr = getHpr(practitioner.identifier)
    if (hpr == null) {
        logger.error('Missing HPR identifier in practitioner resource')
        return { error: 'PARSING_ERROR' }
    }

    if (isLocalOrDemo || isE2E) {
        logger.warn(`Is in demo, local or e2e, submitting send sykmelding values ${JSON.stringify(payload, null, 2)}`)

        return await handleMockedRoute()
    }

    const result = await sykInnApiService.createNewSykmelding({
        pasientFnr: payload.pasient ?? raise('SecureFhir did not provide pasient'),
        sykmelderHpr: hpr,
        sykmelding: {
            hoveddiagnose: {
                system: diagnoseSystemToOid(payload.diagnoser.hoved.system),
                code: payload.diagnoser.hoved.code,
            },
            aktivitet: payload.aktivitet,
        },
        legekontorOrgnr: '999944614', // TODO: Should be retrieved from context/session
    })

    if ('errorType' in result) {
        return { error: 'API_ERROR' }
    }

    return { sykmeldingId: result.sykmeldingId }
})

async function handleMockedRoute(): Promise<CreatedSykmelding> {
    // Fake dev loading
    await wait(1000, 500)

    return { sykmeldingId: 'ba78036d-b63c-4c5a-b3d5-b1d1f812da8d' }
}
