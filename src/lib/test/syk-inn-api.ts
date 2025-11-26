import { GenericContainer, StartedTestContainer, Network, Wait } from 'testcontainers'
import { logger } from '@navikt/next-logger'
import { PostgreSqlContainer } from '@testcontainers/postgresql'
import { KafkaContainer } from '@testcontainers/kafka'

const POSTGRES_ALIAS = 'db'
const KAFKA_ALIAS = 'kafka'

export async function initializeSykInnApi(): Promise<StartedTestContainer> {
    /**
     * Configure a shared networks, that allows containers to communicate with each other
     * on their NATIVE PORTS, not the mapped ones.
     */
    const network = await new Network().start().then((it) => {
        logger.info(`Network started with id: ${it.getId()}`)
        return it
    })

    const [postgres] = await Promise.all([
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
                KAFKA_LISTENERS: 'PLAINTEXT://0.0.0.0:9092,BROKER://0.0.0.0:9093',
                KAFKA_ADVERTISED_LISTENERS: `PLAINTEXT://${KAFKA_ALIAS}:9092,BROKER://${KAFKA_ALIAS}:9093`,
                KAFKA_LISTENER_SECURITY_PROTOCOL_MAP: 'PLAINTEXT:PLAINTEXT,BROKER:PLAINTEXT',
                KAFKA_INTER_BROKER_LISTENER_NAME: 'BROKER',
            })
            .start()
            .then((it) => {
                logger.info(`Kafka started!`)
                return it
            }),
    ])

    const sykInnApi = await new GenericContainer('ghcr.io/navikt/syk-inn-api-test:latest')
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
        .withStartupTimeout(15_000)
        .start()
        .then((it) => {
            logger.info(`syk-inn-api ready!`)
            return it
        })

    return sykInnApi
}

function getBaseUrl(container: StartedTestContainer, port: number = 8080): `http://${string}` {
    return `http://${container.getHost()}:${container.getMappedPort(port)}`
}

export function getSykInnApiPath(container: StartedTestContainer, path: `/${string}`): `http://${string}/${string}` {
    return `${getBaseUrl(container)}${path}`
}
