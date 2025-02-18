import { logger } from '@navikt/next-logger'

import { ApiFetchErrors, fetchInternalAPI } from '@services/api-fetcher'

import { PdlPerson, PdlPersonSchema } from './PdlApiSchema'

export const pdlApiService = {
    getPdlPerson: async (ident: string): Promise<PdlPerson | ApiFetchErrors<'PERSON_NOT_FOUND'>> =>
        fetchInternalAPI({
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
        }),
}
