import { register } from 'prom-client'
import { logger } from '@navikt/next-logger'

export async function GET(): Promise<Response> {
    try {
        const metrics = await register.metrics()

        return new Response(metrics, { headers: { 'Content-Type': register.contentType }, status: 200 })
    } catch (error) {
        logger.error(Error('Error collecting metrics:', { cause: error }))
        return new Response('Error collecting metrics', { status: 500 })
    }
}
