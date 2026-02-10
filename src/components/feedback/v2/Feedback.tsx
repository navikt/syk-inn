import React, { ReactElement } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { BodyShort, InfoCard, LocalAlert } from '@navikt/ds-react'

import { BehandlerFragment } from '@queries'
import SessionIdInfo from '@components/help/SessionIdInfo'

import { FeedbackFormValues } from './form'
import { TypeField } from './fields/TypeField'
import { ContactField } from './fields/ContactField'
import { FeedbackField } from './fields/FeedbackField'
import { SentimentField } from './fields/SentimentField'

type Props = {
    behandler: BehandlerFragment
    onSubmit: (values: FeedbackFormValues) => Promise<void>
}

export function FeedbackV2({ behandler, onSubmit }: Props): ReactElement {
    const form = useForm<FeedbackFormValues>({
        defaultValues: {
            type: 'FORSLAG',
            message: '',
            sentiment: -1,
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
                    <div className="border-b-2 border-ax-border-neutral-subtle" />
                    <SentimentField />
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
