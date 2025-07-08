import { registerInstrumentations } from '@opentelemetry/instrumentation'
import { GraphQLInstrumentation } from '@opentelemetry/instrumentation-graphql'
import { HttpInstrumentation } from '@opentelemetry/instrumentation-http'
import { ExpressInstrumentation } from '@opentelemetry/instrumentation-express'

registerInstrumentations({
    instrumentations: [new GraphQLInstrumentation({}), new HttpInstrumentation(), new ExpressInstrumentation()],
})
