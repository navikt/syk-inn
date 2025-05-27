import { Konsultasjon, PasientInfo } from '@data-layer/resources'

export type AuthError = {
    error: 'AUTH_ERROR'
}

export type ParsingError = {
    error: 'PARSING_ERROR'
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
export function pasientRoute(handler: () => Promise<PasientInfo | AuthError | ParsingError>) {
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

        return Response.json(pasientInfo satisfies PasientInfo, { status: 200 })
    }
}
