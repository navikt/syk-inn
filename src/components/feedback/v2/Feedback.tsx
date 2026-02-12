import React, { ReactElement } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { BodyShort, Detail, Heading, InfoCard, LocalAlert } from '@navikt/ds-react'
import { HandHeartIcon } from '@navikt/aksel-icons'

import { BehandlerFragment } from '@queries'
import SessionIdInfo from '@components/help/SessionIdInfo'
import { SentimentPicker } from '@components/feedback/v2/sentiment/SentimentPicker'

import { FeedbackFormValues } from './form'
import { TypeField } from './fields/TypeField'
import { ContactField } from './fields/ContactField'
import { FeedbackField } from './fields/FeedbackField'

type Props = {
    behandler: BehandlerFragment
    onSubmit: (values: FeedbackFormValues) => Promise<void>
}

export function FullFeedback({ behandler, onSubmit }: Props): ReactElement {
    const form = useForm<FeedbackFormValues>({
        defaultValues: {
            type: 'FORSLAG',
            message: '',
            contact: {
                type: 'NONE',
                phone: behandler.legekontorTlf,
                email: behandler.epost,
            },
        },
    })

    return (
        <section aria-labelledby="Tilbakemeldingsskjema">
            <FormProvider {...form}>
                <form id="feedback-form-v2" className="grid gap-6" onSubmit={form.handleSubmit(onSubmit)}>
                    <TypeField />
                    <FeedbackField />
                    <ContactField />
                </form>
            </FormProvider>
            <InfoCard data-color="info" size="small" className="mt-4">
                <InfoCard.Header>
                    <InfoCard.Title>Datalagring</InfoCard.Title>
                </InfoCard.Header>
                <InfoCard.Content>
                    Tilbakemeldingen din lagres hos Nav og er kun tilgjengelig for teamet som jobber med utvikling av ny
                    innsending av sykmelding.
                </InfoCard.Content>
            </InfoCard>
            {form.formState.errors?.root?.message && (
                <LocalAlert status="error" className="mt-4">
                    <LocalAlert.Header>
                        <LocalAlert.Title>Kunne ikke motta tilbakemelding</LocalAlert.Title>
                    </LocalAlert.Header>
                    <LocalAlert.Content>
                        <BodyShort spacing>
                            Dette er forhåpentligvis en midlertidig feil. Du kan prøve å sende inn på nytt. Dersom
                            problemet vedvarer kan du kontakte oss direkte på Slack.
                        </BodyShort>
                        <BodyShort>Feilen er: {form.formState.errors.root.message}</BodyShort>
                        <SessionIdInfo />
                    </LocalAlert.Content>
                </LocalAlert>
            )}
        </section>
    )
}

export function FullFeedbackSentimentFollowUp({
    onSentiment,
    hasUpdated,
}: {
    hasUpdated: boolean
    onSentiment: (value: number) => void
}): ReactElement {
    return (
        <section aria-labelledby="sentiment-followup-heading" className="flex flex-col items-center">
            <Heading size="xsmall" id="sentiment-followup-heading" spacing>
                Hvor godt liker du å bruke den nye sykmeldingsløsningen?
            </Heading>
            {!hasUpdated ? (
                <>
                    <SentimentPicker onSentiment={onSentiment} />
                </>
            ) : (
                <div className="h-14 flex items-center italic gap-1">
                    Takk for din mening!
                    <HandHeartIcon aria-hidden />
                </div>
            )}
            <Detail className="italic mt-3">Det er helt valgfritt å dele med oss hvor godt du liker løsningen.</Detail>
        </section>
    )
}
