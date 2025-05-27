import { z } from 'zod'

import {
    CreatedSykmelding,
    Konsultasjon,
    Pasient,
    PersonQueryInfo,
    Sykmelding,
    SynchronizationStatus,
} from '@data-layer/resources'
import { SubmitSykmeldingFormValues, SubmitSykmeldingFormValuesSchema } from '@services/syk-inn-api/SykInnApiSchema'

export type AuthError = {
    error: 'AUTH_ERROR'
}

export type ParsingError = {
    error: 'PARSING_ERROR'
}

export type MissingParams = {
    error: 'MISSING_PARAMS'
}

export type ApiError = {
    error: 'API_ERROR'
}

/**
 * Generic route handler for fetching konsultasjon information. This can be used in both FHIR and standalone contexts.
 */
export function konsultasjonRoute(handler: () => Promise<Konsultasjon | AuthError | ParsingError>) {
    return async (): Promise<Response> => {
        const konsultasjonInfo = await handler()

        if ('error' in konsultasjonInfo) {
            switch (konsultasjonInfo.error) {
                case 'AUTH_ERROR': {
                    return Response.json({ message: 'Not allowed' }, { status: 401 })
                }
                case 'PARSING_ERROR': {
                    return Response.json({ message: 'Failed to get konsultasjonsinfo' }, { status: 500 })
                }
                default: {
                    return Response.json({ message: 'Internal server error' }, { status: 500 })
                }
            }
        }

        return Response.json(konsultasjonInfo satisfies Konsultasjon, { status: 200 })
    }
}

/**
 * Generic route handler for fetching pasient information. This can be used in both FHIR and standalone contexts.
 */
export function pasientRoute(handler: () => Promise<Pasient | AuthError | ParsingError>) {
    return async (): Promise<Response> => {
        const pasientInfo = await handler()

        if ('error' in pasientInfo) {
            switch (pasientInfo.error) {
                case 'AUTH_ERROR': {
                    return Response.json({ message: 'Not allowed' }, { status: 401 })
                }
                case 'PARSING_ERROR': {
                    return Response.json({ message: 'Failed to get pasientinfo' }, { status: 500 })
                }
                default: {
                    return Response.json({ message: 'Internal server error' }, { status: 500 })
                }
            }
        }

        return Response.json(pasientInfo satisfies Pasient, { status: 200 })
    }
}

export function personQueryRoute(
    handler: () => Promise<PersonQueryInfo | AuthError | ParsingError | MissingParams | ApiError>,
) {
    return async (): Promise<Response> => {
        const pasientInfos = await handler()

        if ('error' in pasientInfos) {
            switch (pasientInfos.error) {
                case 'MISSING_PARAMS':
                    return Response.json({ message: 'Missing required parameters' }, { status: 400 })
                case 'AUTH_ERROR':
                    return Response.json({ message: 'Not allowed' }, { status: 401 })
                case 'PARSING_ERROR':
                    return Response.json({ message: 'Failed to get pasient search results' }, { status: 500 })
                case 'API_ERROR':
                default: {
                    return Response.json({ message: 'Internal server error' }, { status: 500 })
                }
            }
        }

        return Response.json(pasientInfos satisfies PersonQueryInfo, { status: 200 })
    }
}

export function sykmeldingByIdRoute(
    handler: (sykmeldingId: string) => Promise<Sykmelding | AuthError | ParsingError | MissingParams | ApiError>,
) {
    return async (request: Request, { params }: { params: Promise<{ sykmeldingId: string }> }): Promise<Response> => {
        const sykmeldingId = (await params).sykmeldingId

        const sykmelding = await handler(sykmeldingId)

        if ('error' in sykmelding) {
            switch (sykmelding.error) {
                case 'MISSING_PARAMS':
                    return Response.json({ message: 'Missing required parameters' }, { status: 400 })
                case 'AUTH_ERROR':
                    return Response.json({ message: 'Not allowed' }, { status: 401 })
                case 'PARSING_ERROR':
                    return Response.json({ message: 'Failed to get sykmelding' }, { status: 500 })
                case 'API_ERROR':
                default: {
                    return Response.json({ message: 'Internal server error' }, { status: 500 })
                }
            }
        }

        return Response.json(sykmelding satisfies Sykmelding, { status: 200 })
    }
}

const SubmitSykmeldingPayloadSchema = z.object({
    values: SubmitSykmeldingFormValuesSchema,
})

export function submitSykmeldingRoute(
    handler: (
        payload: SubmitSykmeldingFormValues,
    ) => Promise<CreatedSykmelding | AuthError | ParsingError | MissingParams | ApiError>,
) {
    return async (request: Request): Promise<Response> => {
        const parsedPayload = SubmitSykmeldingPayloadSchema.safeParse(await request.json())
        if (!parsedPayload.success) {
            return Response.json({ message: 'Invalid body', error: parsedPayload.error.message }, { status: 400 })
        }

        const result = await handler(parsedPayload.data.values)

        if ('error' in result) {
            switch (result.error) {
                case 'MISSING_PARAMS':
                    return Response.json({ message: 'Missing required parameters' }, { status: 400 })
                case 'AUTH_ERROR':
                    return Response.json({ message: 'Not allowed' }, { status: 401 })
                case 'PARSING_ERROR':
                    return Response.json({ message: 'Failed to submit sykmelding' }, { status: 500 })
                case 'API_ERROR':
                default: {
                    return Response.json({ message: 'Internal server error' }, { status: 500 })
                }
            }
        }

        return Response.json(result satisfies CreatedSykmelding, { status: 201 })
    }
}

export function synchronizeSykmeldingRoute(
    handler: (
        sykmeldingId: string,
    ) => Promise<SynchronizationStatus | AuthError | ParsingError | MissingParams | ApiError>,
) {
    return async (_: Request, { params }: { params: Promise<{ sykmeldingId: string }> }): Promise<Response> => {
        const sykmeldingId = (await params).sykmeldingId
        const sykmelding = await handler(sykmeldingId)

        if ('error' in sykmelding) {
            switch (sykmelding.error) {
                case 'MISSING_PARAMS':
                    return Response.json({ message: 'Missing required parameters' }, { status: 400 })
                case 'AUTH_ERROR':
                    return Response.json({ message: 'Not allowed' }, { status: 401 })
                case 'PARSING_ERROR':
                    return Response.json({ message: 'Failed to synchronize sykmelding' }, { status: 500 })
                case 'API_ERROR':
                default: {
                    return Response.json({ message: 'Internal server error' }, { status: 500 })
                }
            }
        }

        return Response.json(sykmelding satisfies SynchronizationStatus, { status: 200 })
    }
}
