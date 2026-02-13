import React, { ReactElement, useState } from 'react'
import { BodyShort, Button, Detail, Heading } from '@navikt/ds-react'
import { CheckmarkHeavyIcon, FaceLaughIcon } from '@navikt/aksel-icons'
import { AnimatePresence } from 'motion/react'

import { SimpleReveal } from '@components/animation/Reveal'
import FeedbackInSituForm from '@components/feedback/v2/in-situ/FeedbackInSituForm'
import { useFeedback } from '@components/feedback/v2/useFeedback'

function FeedbackInSitu(): ReactElement {
    const [wantsToFeedback, setWantsToFeedback] = useState(false)

    return (
        <section
            className="mt-6 border border-ax-bg-neutral-moderate bg-ax-bg-sunken rounded-md p-4"
            aria-label="Tilbakemelding"
        >
            {!wantsToFeedback && (
                <div>
                    <Heading size="small" level="4" spacing className="flex gap-1 items-center">
                        Hei!
                        <FaceLaughIcon aria-hidden className="animate-spin" />
                    </Heading>
                    <BodyShort>Vil du dele med oss din opplevelse av å sende inn denne sykmeldingen?</BodyShort>
                    <Detail className="italic mb-4">Det burde ta ca. 30 sekunder.</Detail>
                    <Button
                        variant="secondary"
                        size="small"
                        data-color="neutral"
                        onClick={() => setWantsToFeedback(true)}
                    >
                        Ja takk!
                    </Button>
                </div>
            )}
            <AnimatePresence>
                {wantsToFeedback && (
                    <SimpleReveal>
                        <InSituQuestionaire />
                    </SimpleReveal>
                )}
            </AnimatePresence>
        </section>
    )
}

function InSituQuestionaire(): ReactElement {
    const feedback = useFeedback()

    return (
        <div>
            <Heading size="small" level="4" spacing className="flex gap-1 items-center">
                Din tilbakemelding
            </Heading>
            {!feedback.success && <FeedbackInSituForm onSubmit={feedback.submit} loading={feedback.submitting} />}
            {feedback.success && (
                <div>
                    <BodyShort className="font-bold flex gap-2 items-center">
                        <span className="size-6 bg-ax-bg-success-strong rounded-full text-ax-text-success-contrast">
                            <CheckmarkHeavyIcon aria-hidden className="size-6" />
                        </span>
                        Tilbakemelding mottatt, tusen takk!
                    </BodyShort>
                </div>
            )}
        </div>
    )
}

export default FeedbackInSitu
