import { createFeedbackClient, FeedbackClient } from '@navikt/syk-zara/feedback'

import { productionValkey } from '../valkey/client'

export function getFeedbackClient(): FeedbackClient {
    return createFeedbackClient(productionValkey())
}
