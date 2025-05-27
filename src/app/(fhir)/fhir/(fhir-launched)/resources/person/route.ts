import { logger } from '@navikt/next-logger'
import { headers } from 'next/headers'

import { pdlApiService } from '@services/pdl/PdlApiService'
import { wait } from '@utils/wait'
import { isLocalOrDemo } from '@utils/env'
import { getReadyClient } from '@data-layer/fhir/smart-client'
import { personQueryRoute } from '@data-layer/api-routes/route-handlers'
import { getFnrIdent, getName } from '@services/pdl/PdlApiUtils'
import { PersonQueryInfo } from '@data-layer/resources'

export const GET = personQueryRoute(async () => {
    const client = await getReadyClient({ validate: true })
    if ('error' in client) {
        return { error: 'AUTH_ERROR' }
    }

    const headersStore = await headers()
    const ident = headersStore.get('Ident')
    if (!ident) {
        return { error: 'MISSING_PARAMS' }
    }

    if (isLocalOrDemo) {
        logger.info('Running in local or demo environment, returning mocked person data')
        return handleMockedRoute()
    }

    const person = await pdlApiService.getPdlPerson(ident)
    if ('errorType' in person) {
        return { error: 'API_ERROR' }
    }

    return {
        ident: getFnrIdent(person.identer),
        navn: getName(person.navn),
    }
})

async function handleMockedRoute(): Promise<PersonQueryInfo> {
    // Fake dev loading
    await wait(2500, 500)

    return {
        navn: 'Ola Nordmann',
        ident: '12345678910',
    }
}
