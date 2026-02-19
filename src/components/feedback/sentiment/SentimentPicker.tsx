import React, { ReactElement } from 'react'
import { Button, Tooltip } from '@navikt/ds-react'
import { FaceCryIcon, FaceFrownIcon, FaceIcon, FaceLaughIcon, FaceSmileIcon } from '@navikt/aksel-icons'

import { cn } from '@lib/tw'

export type SentimentLevels = 1 | 2 | 3 | 4 | 5

type Props = {
    className?: string
    value?: SentimentLevels | null
    onSentiment: (sentiment: SentimentLevels) => void
    ariaLabelledby?: string
}

export function SentimentPicker({ className, value, onSentiment, ariaLabelledby }: Props): ReactElement {
    return (
        <div className={cn('flex gap-3', className)} role="radiogroup" aria-labelledby={ariaLabelledby}>
            <SentimentButton
                level={1}
                selected={value === 1}
                tooltip="Jeg er ikke fornøyd"
                onSentiment={onSentiment}
                Icon={FaceCryIcon}
            />
            <SentimentButton
                level={2}
                selected={value === 2}
                tooltip="Jeg er litt misfornøyd"
                onSentiment={onSentiment}
                Icon={FaceFrownIcon}
            />
            <SentimentButton
                level={3}
                selected={value === 3}
                tooltip="Jeg er verken fornøyd eller misfornøyd"
                onSentiment={onSentiment}
                Icon={FaceIcon}
            />
            <SentimentButton
                level={4}
                selected={value === 4}
                tooltip="Jeg er fornøyd"
                onSentiment={onSentiment}
                Icon={FaceSmileIcon}
            />
            <SentimentButton
                level={5}
                selected={value === 5}
                tooltip="Jeg er veldig fornøyd"
                onSentiment={onSentiment}
                Icon={FaceLaughIcon}
            />
        </div>
    )
}

function SentimentButton({
    level,
    selected,
    tooltip,
    onSentiment,
    Icon,
}: {
    level: SentimentLevels
    selected?: boolean
    tooltip: string
    onSentiment: (sentiment: SentimentLevels) => void
    Icon: typeof FaceIcon
}): ReactElement {
    const selectedAndHoverd = (classLevel: number, ...styles: string[]): string =>
        cn({
            [styles.map((it) => `hover:${it}`).join(' ')]: classLevel === level,
            [styles.join(' ')]: selected && classLevel === level,
        })

    return (
        <Tooltip content={tooltip} placement="bottom">
            <Button
                type="button"
                onClick={() => onSentiment(level)}
                icon={
                    <Icon
                        className={cn('size-8 transition-transform group-hover:scale-150', {
                            'scale-150': selected,
                        })}
                        aria-hidden
                    />
                }
                className={cn(
                    'group transition-all hover:scale-120',
                    selectedAndHoverd(1, 'bg-ax-danger-700', 'text-ax-text-danger-contrast'),
                    selectedAndHoverd(2, 'bg-ax-danger-400'),
                    selectedAndHoverd(3, 'bg-ax-info-400'),
                    selectedAndHoverd(4, 'bg-ax-success-400'),
                    selectedAndHoverd(5, 'bg-ax-success-700', 'text-ax-text-success-contrast'),
                    { 'scale-115': selected },
                )}
                variant="tertiary"
                data-color="neutral"
                role="radio"
            />
        </Tooltip>
    )
}
