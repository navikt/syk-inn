import { SentimentLevels } from '@components/feedback/v2/sentiment/SentimentPicker'

export type InSituFeedbackFormValues = {
    sentiment: SentimentLevels | null
    message: string
}
