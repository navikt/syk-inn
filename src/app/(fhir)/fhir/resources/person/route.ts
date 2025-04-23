import { logger } from '@navikt/next-logger'

import { pdlApiService } from '@services/pdl/PdlApiService'
import { wait } from '@utils/wait'
import { PdlPerson } from '@services/pdl/PdlApiSchema'
import { isLocalOrDemo } from '@utils/env'
import { getReadyClient } from '@fhir/smart-client'

type PersonResult = PdlPerson | { errors: { message: string }[] }

export async function GET(request: Request): Promise<Response> {
    const client = await getReadyClient({ validate: true })
    if ('error' in client) {
        if (client.error === 'INVALID_TOKEN') {
            logger.error('Session expired or invalid token')
            return new Response('Unauthorized', { status: 401 })
        }

        logger.error(`Failed to instantiate SmartClient(ReadyClient), reason: ${client.error}`)
        return new Response('Internal server error', { status: 500 })
    }

    const ident = request.headers.get('Ident')
    if (!ident) {
        const data: PersonResult = { errors: [{ message: 'Missing Ident header' }] }
        return Response.json(data)
    }

    if (isLocalOrDemo) {
        logger.warn('Is in demo, local or e2e, returning mocked person')
        return handleMockedRoute()
    }

    const person = await pdlApiService.getPdlPerson(ident)
    if ('errorType' in person) {
        if (person.errorType === 'PERSON_NOT_FOUND') {
            return Response.json({ errors: [{ message: 'Person not found' }] } satisfies PersonResult, { status: 404 })
        }

        return Response.json({ errors: [{ message: 'Failed to fetch person' }] } satisfies PersonResult, {
            status: 500,
        })
    }

    return Response.json(person satisfies PersonResult)
}

async function handleMockedRoute(): Promise<Response> {
    // Fake dev loading
    await wait(2500, 500)

    return Response.json({
        navn: {
            fornavn: 'Test',
            mellomnavn: 'Arne',
            etternavn: 'Testesen',
        },
        identer: [
            {
                ident: '12345678910',
                gruppe: 'FOLKEREGISTERIDENT',
                historisk: false,
            },
        ],
        foedselsdato: '1990-01-01',
    } satisfies PersonResult)
}
