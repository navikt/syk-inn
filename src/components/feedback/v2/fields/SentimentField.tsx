import React, { ReactElement } from 'react'
import { Detail, Label, ToggleGroup, Tooltip } from '@navikt/ds-react'
import {
    FaceCryIcon,
    FaceFrownIcon,
    FaceIcon,
    FaceLaughIcon,
    FaceSmileIcon,
    QuestionmarkIcon,
} from '@navikt/aksel-icons'
import { useController } from 'react-hook-form'

import { FeedbackFormValues } from '../form'

export function SentimentField(): ReactElement {
    const sentiment = useController<FeedbackFormValues, 'sentiment'>({
        name: 'sentiment',
    })

    return (
        <section aria-labelledby="sentiment-heading">
            <Label id="sentiment-heading" spacing>
                Hva er din opplevelse av ny sykmelding?
            </Label>
            <div className="flex items-center justify-center py-2">
                <ToggleGroup
                    defaultValue="-1"
                    className="m-2"
                    {...sentiment.field}
                    onChange={(field) => sentiment.field.onChange(+field)}
                    value={sentiment.field.value.toFixed(0)}
                >
                    <Tooltip content="Har ingen formening">
                        <ToggleGroup.Item
                            className="opacity-70"
                            value="-1"
                            icon={<QuestionmarkIcon className="size-8" aria-hidden />}
                            data-color="neutral"
                        />
                    </Tooltip>
                    <Tooltip content="Jeg er ikke fornøyd">
                        <ToggleGroup.Item
                            value="1"
                            icon={<FaceCryIcon className="size-8" aria-hidden />}
                            data-color="danger"
                        />
                    </Tooltip>
                    <Tooltip content="Jeg er litt misfornøyd">
                        <ToggleGroup.Item
                            value="2"
                            icon={<FaceFrownIcon className="size-8" aria-hidden />}
                            data-color="danger"
                        />
                    </Tooltip>
                    <Tooltip content="Jeg er verken fornøyd eller misfornøyd">
                        <ToggleGroup.Item
                            value="3"
                            icon={<FaceIcon className="size-8" aria-hidden />}
                            data-color="info"
                        />
                    </Tooltip>
                    <Tooltip content="Jeg er fornøyd">
                        <ToggleGroup.Item
                            value="4"
                            icon={<FaceSmileIcon className="size-8" aria-hidden />}
                            data-color="success"
                        />
                    </Tooltip>
                    <Tooltip content="Jeg er veldig fornøyd">
                        <ToggleGroup.Item
                            value="5"
                            icon={<FaceLaughIcon className="size-8" aria-hidden />}
                            data-color="success"
                        />
                    </Tooltip>
                </ToggleGroup>
            </div>
            <Detail className="italic">
                Vi ønsker å vite hvor fornøyd du er med generelt med pilotløsningen! Dette er valgfritt å dele.
            </Detail>
        </section>
    )
}
