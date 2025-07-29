import { logger as pinoLogger } from '@navikt/next-logger'

import { AaregArbeidsforhold } from '@core/services/aareg/aareg-schema'
import { raise } from '@lib/ts'
import { bundledEnv } from '@lib/env'
import { mockEngineForSession, shouldUseMockEngine } from '@dev/mock-engine'

const logger = pinoLogger.child({}, { msgPrefix: '[AAREG Service]: ' })

export const aaregService = {
    getArbeidsforhold: async (
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        ident: string,
    ): Promise<AaregArbeidsforhold[]> => {
        if (shouldUseMockEngine()) {
            const mockEngine = await mockEngineForSession()

            return mockEngine.arbeidsforhold.getArbeidsforhold()
        }

        logger.info(`Fetching arbeidsforhold from AAREG`)

        // TODO
        raise(
            `Aareg is not implemented in ${bundledEnv.runtimeEnv}, this environment should be toggled off in unleash.`,
        )
    },
}
