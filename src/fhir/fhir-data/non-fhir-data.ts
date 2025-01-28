import { logger } from '@navikt/next-logger'

import { wait } from '@utils/wait'
import { pathWithBasePath } from '@utils/url'
import { raise } from '@utils/ts'
import { FhirClient } from '@fhir/fhir-data/fhir-data-service'
import { ExistingSykmeldingSchema, NySykmeldingSchema } from '@services/SykInnApiSchema'

import { ExistingSykmelding, NySykmelding } from '../../data-fetcher/data-service'

const AvailableResources = {
    sykmelding: {
        getPath: (sykmeldingId: string) => pathWithBasePath(`/fhir/sykmelding/${sykmeldingId}`),
        schema: ExistingSykmeldingSchema,
    },
    sendSykmelding: {
        getPath: () => pathWithBasePath('/fhir/sykmelding/submit'),
        schema: NySykmeldingSchema,
    },
}

export async function getSykmelding(
    client: FhirClient,
    hpr: string,
    sykmeldingId: string,
): Promise<ExistingSykmelding> {
    await wait()
    const response = await fetch(AvailableResources.sykmelding.getPath(sykmeldingId), {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            Authorization: client.state.tokenResponse?.access_token ?? raise('No active Smart Session'),
            'X-HPR': hpr,
        },
    })

    if (!response.ok) {
        await handleAPIError(response)
    }

    return AvailableResources.sykmelding.schema.parse(await response.json())
}

export async function sendSykmelding(client: FhirClient, hpr: string, values: unknown): Promise<NySykmelding> {
    await wait()
    const response = await fetch(AvailableResources.sendSykmelding.getPath(), {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: client.state.tokenResponse?.access_token ?? raise('No active Smart Session'),
        },
        body: JSON.stringify({
            values,
            behandlerHpr: hpr,
        }),
    })

    if (!response.ok) {
        await handleAPIError(response)
    }

    return AvailableResources.sendSykmelding.schema.parse(await response.json())
}

async function handleAPIError(response: Response): Promise<never> {
    if (response.headers.get('content-type')?.includes('application/json')) {
        const errors = await response.json()
        logger.error(`${response.url} failed (${response.status} ${response.statusText}), errors`, {
            cause: errors,
        })
    } else {
        logger.error(`Next API Responded with error ${response.status} ${response.statusText}`)
    }

    throw new Error('Next API Responded with error')
}
