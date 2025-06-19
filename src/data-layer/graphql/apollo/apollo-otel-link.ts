import { ApolloLink } from '@apollo/client'

import { getBrowserOTEL } from '@otel/faro'
import { APP_NAME } from '@otel/common'

export const otelLink = new ApolloLink((operation, forward) => {
    const otel = getBrowserOTEL()
    if (otel == null) {
        return forward(operation)
    }

    const tracer = otel.trace.getTracer(APP_NAME)
    const span = tracer.startSpan(`Apollo: ${operation.operationName}`)

    operation.setContext({ span })

    return otel.context.with(otel.trace.setSpan(otel.context.active(), span), () =>
        forward(operation).map((data) => {
            span.end()
            return data
        }),
    )
})
