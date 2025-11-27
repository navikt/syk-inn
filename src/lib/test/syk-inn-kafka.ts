import { Consumer, Kafka, logLevel } from 'kafkajs'
import { StartedKafkaContainer } from '@testcontainers/kafka'

const INPUT_TOPIC_NAME = 'tsm.sykmeldinger-input'

export async function initializeKafka(container: StartedKafkaContainer): Promise<Kafka> {
    return new Kafka({
        clientId: 'syk-inn-test',
        brokers: [`localhost:${container.getMappedPort(9093)}`],
        logLevel: logLevel.ERROR,
    })
}

export async function initializeConsumer(kafka: Kafka): Promise<Consumer> {
    const consumer = kafka.consumer({ groupId: crypto.randomUUID() })
    await consumer.subscribe({ topic: INPUT_TOPIC_NAME, fromBeginning: true })

    return consumer
}

// eslint-disable-next-line
export async function consumeUntil(consumer: Consumer, sykmeldingId: string): Promise<any> {
    return new Promise<unknown>((resolve, reject) => {
        const timeout = setTimeout(() => {
            reject(new Error(`Timeout waiting for message with key ${sykmeldingId}`))
        }, 10_000)

        consumer.run({
            eachMessage: async ({ message }) => {
                const key = message.key?.toString()
                if (key === sykmeldingId) {
                    clearTimeout(timeout)
                    resolve(JSON.parse(message.value!.toString()))
                }
            },
        })
    })
}
