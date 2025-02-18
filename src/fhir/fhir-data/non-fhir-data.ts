import { logger } from '@navikt/next-logger'

import { wait } from '@utils/wait'
import { pathWithBasePath } from '@utils/url'
import { raise } from '@utils/ts'
import { FhirClient } from '@fhir/fhir-data/fhir-data-service'
import { ExistingSykmeldingSchema, NySykmeldingSchema } from '@services/syk-inn-api/SykInnApiSchema'
import { PdlPersonSchema } from '@services/pdl/PdlApiSchema'
import { getFnrIdent } from '@services/pdl/PdlApiUtils'

import { ArbeidsgiverInfo, ExistingSykmelding, NySykmelding, PasientQueryInfo } from '../../data-fetcher/data-service'

const AvailableResources = {
    sykmelding: {
        getPath: (sykmeldingId: string) => pathWithBasePath(`/fhir/sykmelding/${sykmeldingId}`),
        schema: ExistingSykmeldingSchema,
    },
    sendSykmelding: {
        getPath: () => pathWithBasePath('/fhir/sykmelding/submit'),
        schema: NySykmeldingSchema,
    },
    person: {
        getPath: () => pathWithBasePath(`/fhir/person`),
        schema: PdlPersonSchema,
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

export async function getPerson(client: FhirClient, ident: string): Promise<PasientQueryInfo> {
    await wait()
    const response = await fetch(AvailableResources.person.getPath(), {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            Authorization: client.state.tokenResponse?.access_token ?? raise('No active Smart Session'),
            'X-Ident': ident,
        },
    })

    if (!response.ok) {
        if (response.status === 404) {
            throw new Error('Fant ikke person i registeret')
        }

        await handleAPIError(response)
    }

    const parsed = AvailableResources.person.schema.parse(await response.json())
    const fnrOrDnr = getFnrIdent(parsed.identer)
    if (!fnrOrDnr) {
        throw new Error('No valid fnr or dnr found')
    }

    return {
        navn: `${parsed.navn.fornavn}${parsed.navn.mellomnavn ? ` ${parsed.navn.mellomnavn}` : ''} ${parsed.navn.etternavn}`,
        ident: {
            type: 'fnr',
            nr: fnrOrDnr,
        },
    }
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

export async function getArbeidsgivere(): Promise<ArbeidsgiverInfo[]> {
    await wait()

    return [
        {
            navn: 'Arbeidsgiver 1',
            organisasjonsnummer: '123456789',
        },
        {
            navn: 'Arbeidsgiver 2',
            organisasjonsnummer: '987654321',
        },
    ]
}
