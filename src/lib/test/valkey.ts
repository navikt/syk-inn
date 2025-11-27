import { logger } from '@navikt/next-logger'
import { GenericContainer, StartedTestContainer } from 'testcontainers'

export async function initializeValkey(): Promise<StartedTestContainer> {
    return new GenericContainer('valkey/valkey:latest')
        .withExposedPorts(6379)
        .start()
        .then((it) => {
            logger.info(`Valkey started!`)
            return it
        })
}
