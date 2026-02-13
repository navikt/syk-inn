import React, { ReactElement } from 'react'
import { useController, useForm } from 'react-hook-form'
import { Button, InlineMessage, Label, Textarea } from '@navikt/ds-react'

import { InSituFeedbackFormValues } from '@components/feedback/v2/in-situ/form'

import { SentimentPicker } from '../sentiment/SentimentPicker'

type Props = {
    loading: boolean
    onSubmit: (values: InSituFeedbackFormValues) => void
}

function FeedbackInSituForm({ loading, onSubmit }: Props): ReactElement {
    const form = useForm<InSituFeedbackFormValues>({
        defaultValues: {
            sentiment: null,
            message: '',
        },
    })

    const sentiment = useController({
        name: 'sentiment',
        control: form.control,
    })
    const message = useController({
        name: 'message',
        control: form.control,
        rules: {
            required: 'Fint om du skriver litt om opplevelsen din',
        },
    })

    return (
        <form onSubmit={form.handleSubmit(onSubmit)}>
            <Textarea
                label="Hvordan synes du den nye løsningen fungerer sammenlignet med den gamle?"
                {...message.field}
                description={
                    <InlineMessage status="info" size="small">
                        Husk å ikke dele noe personidentifiserende informasjon i tilbakemeldingen
                    </InlineMessage>
                }
                error={message.fieldState.error?.message}
                maxLength={500}
            />
            <div className="mt-4">
                <Label id="sentiment-picker-label">Hvor fornøyd er du med den nye løsningen?</Label>
                <SentimentPicker
                    ariaLabelledby="sentiment-picker-label"
                    className="mt-2 border border-ax-border-neutral-subtle w-fit rounded-xl p-1 bg-ax-bg-default"
                    value={sentiment.field.value}
                    onSentiment={(value) => sentiment.field.onChange(value)}
                />
            </div>
            <div className="mt-8">
                <Button type="submit" loading={loading}>
                    Send tilbakemelding
                </Button>
            </div>
        </form>
    )
}

export default FeedbackInSituForm
