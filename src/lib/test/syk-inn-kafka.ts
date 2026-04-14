import { Consumer, Kafka, logLevel } from 'kafkajs'
import { StartedKafkaContainer } from '@testcontainers/kafka'

import { KafkaSykmeldingRecord } from '@lib/test/syk-inn-kafka-types'

const INPUT_TOPIC_NAME = 'tsm.sykmeldinger-input'

export async function initializeKafka(container: StartedKafkaContainer): Promise<Kafka> {
    const kafka = new Kafka({
        clientId: 'syk-inn-test',
        brokers: [`${container.getHost()}:${container.getMappedPort(9093)}`],
        logLevel: logLevel.ERROR,
    })

    const admin = kafka.admin()
    await admin.connect()
    await admin.createTopics({
        topics: [{ topic: INPUT_TOPIC_NAME, numPartitions: 1 }],
    })
    await admin.disconnect()
    return kafka
}

export async function initializeLocalKafka(): Promise<Kafka> {
    const kafka = new Kafka({
        clientId: 'syk-inn-test',
        brokers: [`localhost:9092`],
        logLevel: logLevel.ERROR,
    })

    const admin = kafka.admin()
    await admin.connect()
    await admin.createTopics({
        topics: [{ topic: INPUT_TOPIC_NAME, numPartitions: 1 }],
    })
    await admin.disconnect()
    return kafka
}

export async function initializeConsumer(kafka: Kafka): Promise<Consumer> {
    const consumer = kafka.consumer({ groupId: crypto.randomUUID() })
    await consumer.subscribe({ topic: INPUT_TOPIC_NAME, fromBeginning: true })
    return consumer
}

export async function consumeUntil(consumer: Consumer, sykmeldingId: string): Promise<KafkaSykmeldingRecord> {
    return new Promise<KafkaSykmeldingRecord>((resolve, reject) => {
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
