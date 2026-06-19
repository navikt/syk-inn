import { logger as pinoLogger } from '@navikt/next-logger'

import { mockEngineForSession, shouldUseMockEngine } from '#dev/mock-engine'
import { bundledEnv } from '#lib/env'
import { raise } from '#lib/ts'

import { AaregArbeidsforhold } from './aareg-schema'

const logger = pinoLogger.child({}, { msgPrefix: '[AAREG Service]: ' })

export const aaregService = {
    getArbeidsforhold: async (
        // oxlint-disable-next-line no-unused-vars
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
