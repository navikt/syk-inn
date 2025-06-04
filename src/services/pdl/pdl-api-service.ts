import { logger } from '@navikt/next-logger'

import { ApiFetchErrors, fetchInternalAPI } from '@services/api-fetcher'
import { isE2E, isLocalOrDemo } from '@utils/env'
import { createPdlPersonMock } from '@services/pdl/pdl-api-mock-data'

import { PdlPerson, PdlPersonSchema } from './pdl-api-schema'

export const pdlApiService = {
    getPdlPerson: async (ident: string): Promise<PdlPerson | ApiFetchErrors<'PERSON_NOT_FOUND'>> => {
        if (isLocalOrDemo || isE2E) {
            logger.warn('Running in local or demo environment, returning mocked PDL data')
            return createPdlPersonMock()
        }

        return fetchInternalAPI({
            api: 'tsm-pdl-cache',
            path: `/api/person`,
            method: 'GET',
            headers: { Ident: ident },
            responseSchema: PdlPersonSchema,
            onApiError: (response) => {
                if (response.status === 404) {
                    logger.error(
                        `Unable to fetch person with ident ${ident} (${response.status} ${response.statusText}`,
                    )

                    return 'PERSON_NOT_FOUND'
                }
            },
        })
    },
}
