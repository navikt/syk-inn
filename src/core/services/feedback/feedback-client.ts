import { createFeedbackClient, FeedbackClient } from '@navikt/syk-zara/feedback'

import { realValkey } from '../valkey/client'

export async function getFeedbackClient(): Promise<FeedbackClient> {
    return createFeedbackClient(await realValkey())
}
