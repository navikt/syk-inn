'use client'

import React, { ReactElement } from 'react'
import { BodyShort, Button, Dialog, Heading, LocalAlert, Skeleton } from '@navikt/ds-react'
import { useQuery } from '@apollo/client/react'
import { CheckmarkHeavyIcon } from '@navikt/aksel-icons'

import { BehandlerDocument } from '@queries'
import SessionIdInfo from '@components/help/SessionIdInfo'
import LegeOgBehandlerTelefonen from '@components/help/LegeOgBehandlerTelefonen'
import { useFeedback } from '@components/feedback/v2/useFeedback'

import { FullFeedback, FullFeedbackSentimentFollowUp } from './Feedback'

function FeedbackButton(): ReactElement {
    const feedback = useFeedback()
    const behandler = useQuery(BehandlerDocument, { notifyOnNetworkStatusChange: true })
    const hasBehandler = !behandler.loading && behandler.data?.behandler != null
    const handleOpenChange = (nextOpen: boolean, event?: Event): void => {
        if (!nextOpen && hasBehandler && !feedback.success) {
            const confirmClose = window.confirm('Er du sikker på at du vil forkaste tilbakemeldingen?')
            if (!confirmClose) {
                event?.preventDefault()
            }
        }
    }

    return (
        <div className="fixed -bottom-1 right-72 w-fit animate-bounce">
            <Dialog onOpenChange={handleOpenChange}>
                <Dialog.Trigger>
                    <Button variant="secondary-neutral" size="small" className="bg-ax-bg-default rounded-b-none">
                        Tilbakemelding V2
                    </Button>
                </Dialog.Trigger>
                <Dialog.Popup position="right" id="feedback-dialog">
                    <Dialog.Header>
                        <Dialog.Title>Tilbakemelding på pilot</Dialog.Title>
                        <Dialog.Description>
                            Her kan du rapportere om feil, gi tilbakemelding eller stille spørsmål om pilot for ny
                            innsending av sykmelding.
                        </Dialog.Description>
                    </Dialog.Header>
                    <Dialog.Body>
                        {behandler.loading && <Skeleton variant="rounded" width="100%" height={569} />}
                        {behandler.data?.behandler && !feedback.success && (
                            <FullFeedback
                                behandler={behandler.data.behandler}
                                onSubmit={(values) => feedback.submit(values)}
                            />
                        )}
                        {behandler.data?.behandler == null && !behandler.loading && (
                            <FeedbackErrorNoBehandler refetch={() => behandler.refetch()} />
                        )}
                        {feedback.success != null && (
                            <div className="h-96 w-full flex items-center justify-center flex flex-col gap-4 mt-16">
                                <div className="size-24 bg-ax-bg-success-strong rounded-full text-ax-text-success-contrast">
                                    <CheckmarkHeavyIcon aria-hidden className="size-24" />
                                </div>
                                <Heading size="large" level="3">
                                    Tilbakemelding mottatt, tusen takk!
                                </Heading>
                                <div className="mt-16">
                                    <FullFeedbackSentimentFollowUp
                                        onSentiment={(sentiment) => {
                                            feedback.updateSentiment(sentiment)
                                        }}
                                        hasUpdated={feedback.sentimentUpdated}
                                    />
                                </div>
                            </div>
                        )}
                    </Dialog.Body>
                    {!feedback.success ? (
                        <Dialog.Footer className="mt-auto">
                            <Dialog.CloseTrigger>
                                <Button
                                    id="close-feedback-button"
                                    variant="secondary"
                                    size="small"
                                    disabled={feedback.submitting}
                                >
                                    Avbryt tilbakemelding
                                </Button>
                            </Dialog.CloseTrigger>
                            <Button form="feedback-form-v2" type="submit" loading={feedback.submitting}>
                                Send inn Tilbakemeldingen
                            </Button>
                        </Dialog.Footer>
                    ) : (
                        <Dialog.Footer className="mt-auto">
                            <Dialog.CloseTrigger>
                                <Button variant="secondary">Lukk</Button>
                            </Dialog.CloseTrigger>
                        </Dialog.Footer>
                    )}
                </Dialog.Popup>
            </Dialog>
        </div>
    )
}

function FeedbackErrorNoBehandler({ refetch }: { refetch: () => void }): ReactElement {
    return (
        <LocalAlert status="warning">
            <LocalAlert.Header>
                <LocalAlert.Title>Fant ingen detaljer om deg</LocalAlert.Title>
            </LocalAlert.Header>
            <LocalAlert.Content>
                <BodyShort spacing>
                    Vi klarte ikke å laste informasjon om deg. Dette kan være et midlertidig problem.
                </BodyShort>
                <BodyShort spacing>Du kan prøve å sende inn en tilbakemelding senere.</BodyShort>
                <Button variant="secondary" data-color="neutral" className="mb-2" size="small" onClick={refetch}>
                    Prøv å hente informasjon på nytt
                </Button>
                <LegeOgBehandlerTelefonen />
                <SessionIdInfo />
            </LocalAlert.Content>
        </LocalAlert>
    )
}

export default FeedbackButton
