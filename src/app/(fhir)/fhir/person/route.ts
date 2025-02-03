import { logger } from '@navikt/next-logger'

import { ensureFhirApiAuthenticated } from '@fhir/auth/api-utils'
import { getPdlPerson } from '@services/pdl/PdlApiService'
import { wait } from '@utils/wait'
import { PdlPerson } from '@services/pdl/PdlApiSchema'
import { isLocalOrDemo } from '@utils/env'

type PersonResult = PdlPerson | { errors: { message: string }[] }

export async function GET(request: Request): Promise<Response> {
    const authStatus = await ensureFhirApiAuthenticated()
    if (authStatus !== 'ok') {
        return authStatus
    }

    const ident = request.headers.get('X-Ident')
    if (!ident) {
        const data: PersonResult = { errors: [{ message: 'Missing X-Ident' }] }
        return Response.json(data)
    }

    if (isLocalOrDemo) {
        logger.warn('Is in demo, local or e2e, returning mocked person')
        return handleMockedRoute()
    }

    const person = await getPdlPerson(ident)
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
