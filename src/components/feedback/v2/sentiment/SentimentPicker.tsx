import React, { ReactElement } from 'react'
import { Button, Tooltip } from '@navikt/ds-react'
import { FaceCryIcon, FaceFrownIcon, FaceIcon, FaceLaughIcon, FaceSmileIcon } from '@navikt/aksel-icons'

import { cn } from '@lib/tw'

type Levels = 1 | 2 | 3 | 4 | 5

type Props = {
    onSentiment: (sentiment: Levels) => void
}

export function SentimentPicker({ onSentiment }: Props): ReactElement {
    return (
        <div className="flex gap-2">
            <SentimentButton level={1} tooltip="Jeg er ikke fornøyd" onSentiment={onSentiment} Icon={FaceCryIcon} />
            <SentimentButton
                level={2}
                tooltip="Jeg er litt misfornøyd"
                onSentiment={onSentiment}
                Icon={FaceFrownIcon}
            />
            <SentimentButton
                level={3}
                tooltip="Jeg er verken fornøyd eller misfornøyd"
                onSentiment={onSentiment}
                Icon={FaceIcon}
            />
            <SentimentButton level={4} tooltip="Jeg er fornøyd" onSentiment={onSentiment} Icon={FaceSmileIcon} />
            <SentimentButton level={5} tooltip="Jeg er veldig fornøyd" onSentiment={onSentiment} Icon={FaceLaughIcon} />
        </div>
    )
}

function SentimentButton({
    level,
    tooltip,
    onSentiment,
    Icon,
}: {
    level: Levels
    tooltip: string
    onSentiment: (sentiment: Levels) => void
    Icon: typeof FaceIcon
}): ReactElement {
    return (
        <Tooltip content={tooltip} placement="bottom">
            <Button
                onClick={() => onSentiment(level)}
                icon={<Icon className="size-8 transition-transform group-hover:scale-150" aria-hidden />}
                className={cn('group transition-all hover:scale-120', {
                    'hover:bg-ax-danger-700 hover:text-ax-text-danger-contrast': level === 1,
                    'hover:bg-ax-danger-400': level === 2,
                    'hover:bg-ax-info-400': level === 3,
                    'hover:bg-ax-success-400': level === 4,
                    'hover:bg-ax-success-700 hover:text-ax-text-success-contrast': level === 5,
                })}
                variant="tertiary"
                data-color="neutral"
            />
        </Tooltip>
    )
}
