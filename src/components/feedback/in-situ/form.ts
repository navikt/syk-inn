import { SentimentLevels } from '@components/feedback/sentiment/SentimentPicker'

export type InSituFeedbackFormValues = {
    sentiment: SentimentLevels | null
    message: string
}
