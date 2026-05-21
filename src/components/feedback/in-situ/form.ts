import { SentimentLevels } from '../sentiment/SentimentPicker'

export type InSituFeedbackFormValues = {
    sentiment: SentimentLevels | null
    message: string
}
