import { useFormContext } from 'react-hook-form'

export type FeedbackFormValues = {
    type: 'FORSLAG' | 'FEIL' | 'ANNET'
    message: string
    sentiment: number
    contact: {
        type: 'NONE' | 'EMAIL' | 'PHONE'
        email: string | null
        phone: string | null
    }
}

export const useFeedbackContext = useFormContext<FeedbackFormValues>
