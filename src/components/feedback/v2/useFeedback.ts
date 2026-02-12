import { useReducer } from 'react'
import { logger } from '@navikt/next-logger'
import * as R from 'remeda'
import { useParams, usePathname } from 'next/navigation'

import { spanBrowserAsync } from '@lib/otel/browser'
import { FullFeedbackPayload, FeedbackUpdateSentimentPayload } from '@core/services/feedback/feedback-payload'
import { useMode } from '@core/providers/Modes'
import { pathWithBasePath } from '@lib/url'
import { getBrowserSessionId } from '@lib/otel/faro'

import { FeedbackFormValues } from './form'

type UseFeedback = {
    submitting: boolean
    success: { feedbackId: string } | null
    error: string | null
    submit: (values: FeedbackFormValues) => Promise<void>
}

type UpdateSentiment = {
    updateSentiment: (sentiment: number) => Promise<void>
    sentimentUpdated: boolean
}

export function useFeedback(): UseFeedback & UpdateSentiment {
    const mode = useMode()
    const [state, dispatch] = useReducer(feedbackReducer, defaultFeedbackState)
    const formValuesToPayload = useFormValuesToPayload()

    const handleSubmit = async (values: FeedbackFormValues): Promise<void> => {
        dispatch({ type: 'SENDING_FEEDBACK' })
        try {
            await spanBrowserAsync('Feedback.onSubmit', async () => {
                const payload = formValuesToPayload(values)
                const response = await fetch(pathWithBasePath(mode.paths.feedback) + '?variant=v2', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload),
                })

                if (response.ok) {
                    const data: { feedbackId: string } = await response.json()

                    dispatch({ type: 'SUCCESS', feedbackId: data.feedbackId })
                    return
                }

                const data = await response.json()
                dispatch({ type: 'ERROR', message: data.message })
            })
        } catch (e) {
            logger.error(e)
            dispatch({ type: 'ERROR', message: 'Ukjent systemfeil' })
        }
    }

    const handleUpdateSentiment = async (sentiment: number): Promise<void> => {
        if (state.state !== 'submitted') {
            logger.warn('Tried to update sentiment without having been submitted first. How?!')
            return
        }

        await spanBrowserAsync('Feedback.updateSentiment', async () => {
            dispatch({ type: 'UPDATING_SENTIMENT' })

            const payload: FeedbackUpdateSentimentPayload = {
                id: state.success.feedbackId,
                sentiment: sentiment,
            }

            const response = await fetch(pathWithBasePath(mode.paths.feedback) + '?variant=v2', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            })

            if (response.ok) {
                dispatch({ type: 'SENTIMENT_SUCCESS' })
                return
            }

            const serverSays = await response.text()
            logger.error(new Error(`Unable to update sentiment, ${response.status}: ${serverSays}`))
        })
    }

    return {
        submitting: state.loading,
        success: state.success != null ? { feedbackId: state.success.feedbackId } : null,
        submit: handleSubmit,
        error: state.error,
        updateSentiment: handleUpdateSentiment,
        sentimentUpdated: state.state === 'updated',
    }
}

/**
 * Custom hook to curry a mapper function, as we use other hooks to extract metadata
 */
function useFormValuesToPayload(): (values: FeedbackFormValues) => FullFeedbackPayload {
    const params = useParams()
    const path = usePathname()

    return (values: FeedbackFormValues): FullFeedbackPayload => {
        const contact = {
            type: values.contact.type,
            details:
                values.contact.type === 'PHONE'
                    ? values.contact.phone
                    : values.contact.type === 'EMAIL'
                      ? values.contact.email
                      : null,
        }

        const routeParams: Record<string, string | null> = R.mapValues(params, (it) =>
            Array.isArray(it) ? it.join(',') : (it ?? null),
        )

        return {
            type: values.type,
            message: values.message,
            contact: contact,
            meta: {
                location: path,
                dev: {
                    ...routeParams,
                    sessionId: getBrowserSessionId(),
                },
            },
        }
    }
}

type SuccessState = {
    state: 'submitted' | 'updated' | 'updating_sentiment'
    success: { feedbackId: string }
    loading: false
    error: null
}

type OtherState = {
    state: 'idle' | 'submitting' | 'error'
    loading: boolean
    success: null
    error: string | null
}

type Actions =
    | { type: 'SENDING_FEEDBACK' }
    | { type: 'UPDATING_SENTIMENT' }
    | { type: 'SUCCESS'; feedbackId: string }
    | { type: 'SENTIMENT_SUCCESS' }
    | { type: 'ERROR'; message: string }

const feedbackReducer = (state: SuccessState | OtherState, action: Actions): SuccessState | OtherState => {
    switch (action.type) {
        case 'SENDING_FEEDBACK':
            return {
                ...state,
                state: 'submitting',
                loading: true,
                error: null,
                success: null,
            } satisfies OtherState
        case 'SUCCESS':
            return {
                ...state,
                loading: false,
                state: 'submitted',
                success: { feedbackId: action.feedbackId },
                error: null,
            } satisfies SuccessState
        case 'SENTIMENT_SUCCESS':
            return {
                ...(state as SuccessState),
                state: 'updated',
                loading: false,
                error: null,
            } satisfies SuccessState
        case 'UPDATING_SENTIMENT':
            return {
                ...(state as SuccessState),
                state: 'updating_sentiment',
                // This is a "optimistic" fire and forget action, and does not trigger loading state
                loading: false,
            } satisfies SuccessState
        case 'ERROR':
            return {
                ...state,
                loading: false,
                state: 'error',
                error: action.message,
                success: null,
            } satisfies OtherState
    }
}

const defaultFeedbackState: OtherState = {
    state: 'idle',
    loading: false,
    error: null,
    success: null,
}
