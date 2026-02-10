import { useState } from 'react'
import { logger } from '@navikt/next-logger'
import * as R from 'remeda'
import { useParams, usePathname } from 'next/navigation'

import { spanBrowserAsync } from '@lib/otel/browser'
import { FeedbackPayload } from '@core/services/feedback/feedback-payload'
import { useMode } from '@core/providers/Modes'
import { pathWithBasePath } from '@lib/url'
import { getBrowserSessionId } from '@lib/otel/faro'

import { FeedbackFormValues } from './form'

export function useFeedback(): {
    submitting: boolean
    success: boolean
    error: string | null
    submit: (values: FeedbackFormValues) => Promise<void>
} {
    const mode = useMode()
    const [submitting, setSubmitting] = useState(false)
    const [success, setSuccess] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const formValuesToPayload = useFormValuesToPayload()

    const handleSubmit = async (values: FeedbackFormValues): Promise<void> => {
        setSubmitting(true)
        try {
            await spanBrowserAsync('Feedback.onSubmit', async () => {
                const payload = formValuesToPayload(values)

                const response = await fetch(pathWithBasePath(mode.paths.feedback) + '?variant=v2', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload),
                })

                if (response.ok) {
                    setSubmitting(false)
                    setSuccess(true)
                    setError(null)
                    return
                }

                const data = await response.json()
                setError(data.message)
            })
        } catch (e) {
            logger.error(e)
            setError('Ukjent systemfeil')
            setSuccess(false)
        } finally {
            setSubmitting(false)
        }
    }

    return { submitting, success, error, submit: handleSubmit }
}

/**
 * Custom hook to curry a mapper function, as we use other hooks to extract metadata
 */
function useFormValuesToPayload(): (values: FeedbackFormValues) => FeedbackPayload {
    const params = useParams()
    const path = usePathname()

    return (values: FeedbackFormValues): FeedbackPayload => {
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
            sentiment: values.sentiment >= 1 ? values.sentiment : null,
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
