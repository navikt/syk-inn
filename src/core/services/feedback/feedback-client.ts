import { createFeedbackClient, FeedbackClient } from '@navikt/syk-zara/feedback'

import { productionValkey } from '../valkey/client'

export async function getFeedbackClient(): Promise<FeedbackClient> {
    return createFeedbackClient(await productionValkey())
}
