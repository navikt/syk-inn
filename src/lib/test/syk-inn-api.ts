import { GenericContainer, StartedTestContainer, Network, Wait } from 'testcontainers'
import { logger } from '@navikt/next-logger'
import { PostgreSqlContainer } from '@testcontainers/postgresql'
import { KafkaContainer, StartedKafkaContainer } from '@testcontainers/kafka'

import { streamToStdout } from '@lib/test/testcontainers-utils'

const POSTGRES_ALIAS = 'db'
const KAFKA_ALIAS = 'kafka'

/**
 * See README for local run with syk-inn-api-local docker image
 */
const SYK_INN_API_IMAGE =
    // TODO: This uses the branch specific image, should be cleaned up before go-live
    process.env.SYK_INN_API_INTEGRATION_TESTS_IMAGE || 'ghcr.io/navikt/syk-inn-api-ktor-test:latest'
if (!(SYK_INN_API_IMAGE.startsWith('ghcr.io/navikt') || SYK_INN_API_IMAGE.startsWith('syk-inn-api-local'))) {
    throw new Error("Oop! This image isn't under ghcr.io/navikt, that seems illegal 🤔")
}

if (process.env.SYK_INN_API_INTEGRATION_TESTS_IMAGE) {
    logger.info(`Using syk-inn-api image from SYK_INN_API_INTEGRATION_TESTS_IMAGE: ${SYK_INN_API_IMAGE}`)
}

export async function initializeSykInnApi(applog: boolean = false): Promise<{
    sykInnApi: StartedTestContainer
    kafka: StartedKafkaContainer
}> {
    /**
     * Configure a shared networks, that allows containers to communicate with each other
     * on their NATIVE PORTS, not the mapped ones.
     */
    const network = await new Network().start().then((it) => {
        logger.info(`Network started with id: ${it.getId()}`)
        return it
    })

    const [postgres, kafka] = await Promise.all([
        new PostgreSqlContainer('postgres:16-alpine')
            .withNetwork(network)
            .withNetworkAliases(POSTGRES_ALIAS)
            .withDatabase('syk-inn-db')
            .start()
            .then((it) => {
                logger.info(`Postgres started!`)
                return it
            }),
        new KafkaContainer('confluentinc/cp-kafka:8.1.0')
            .withNetwork(network)
            .withNetworkAliases(KAFKA_ALIAS)
            .withEnvironment({
                AUTO_CREATE_TOPICS_ENABLE: 'true',
            })
            .start()
            .then((it) => {
                logger.info(`Kafka started!`)
                return it
            }),
    ])

    const sykInnApi = await new GenericContainer(SYK_INN_API_IMAGE)
        .withNetwork(network)
        .withEnvironment({
            DB_URL: `postgresql://${POSTGRES_ALIAS}:5432/${postgres.getDatabase()}`,
            DB_USERNAME: postgres.getUsername(),
            DB_PASSWORD: postgres.getPassword(),
            BOOTSTRAP_SERVERS: `${KAFKA_ALIAS}:9092`,
        })
        .withCommand(['app.jar', '-config=application-local.conf'])
        .withExposedPorts(8080)
        .withWaitStrategy(Wait.forHttp('/internal/health/alive', 8080))
        .withStartupTimeout(30_000)
        .withLogConsumer(applog ? streamToStdout : () => void 0)
        .start()
        .then((it) => {
            logger.info(`syk-inn-api ready!`)
            return it
        })

    return { sykInnApi, kafka }
}
