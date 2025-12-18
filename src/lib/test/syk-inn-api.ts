import { GenericContainer, StartedTestContainer, Network, Wait } from 'testcontainers'
import { logger } from '@navikt/next-logger'
import { PostgreSqlContainer } from '@testcontainers/postgresql'
import { KafkaContainer, StartedKafkaContainer } from '@testcontainers/kafka'

import { streamToStdout } from '@lib/test/testcontainers-utils'

const POSTGRES_ALIAS = 'db'
const KAFKA_ALIAS = 'kafka'

const SYK_INN_API_IMAGE = process.env.SYK_INN_API_INTEGRATION_TESTS_IMAGE || 'ghcr.io/navikt/syk-inn-api-test:latest'
if (!SYK_INN_API_IMAGE.startsWith('ghcr.io/navikt')) {
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
            SPRING_PROFILES_ACTIVE: 'local',
            DB_URL: `jdbc:postgresql://${POSTGRES_ALIAS}:5432/${postgres.getDatabase()}?reWriteBatchedInserts=true`,
            DB_USER: postgres.getUsername(),
            DB_PASSWORD: postgres.getPassword(),
            BOOTSTRAP_SERVERS: `${KAFKA_ALIAS}:9092`,
        })
        .withExposedPorts(8080)
        .withWaitStrategy(Wait.forHttp('/internal/health', 8080))
        .withStartupTimeout(30_000)
        .withLogConsumer(applog ? streamToStdout : () => void 0)
        .start()
        .then((it) => {
            logger.info(`syk-inn-api ready!`)
            return it
        })

    return { sykInnApi, kafka }
}

function getBaseUrl(container: StartedTestContainer, port: number = 8080): `http://${string}` {
    return `http://${container.getHost()}:${container.getMappedPort(port)}`
}

export function getSykInnApiPath(container: StartedTestContainer, path: `/${string}`): `http://${string}/${string}` {
    return `${getBaseUrl(container)}${path}`
}
