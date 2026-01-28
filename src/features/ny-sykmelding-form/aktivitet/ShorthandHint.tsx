import React, { ReactElement } from 'react'
import { BodyShort, Detail, Popover } from '@navikt/ds-react'

import { getRangeDescription } from '@features/ny-sykmelding-form/aktivitet/periode/periode-utils'

type Props = {
    focused: boolean
    suggestion: { from: Date; to: Date } | null
    anchorEl: Element | null
}

/**
 * Custom Popover that displays a hint when the user is focused and has typed a valid shorthand date range
 */
export function ShorthandHint({ focused, suggestion, anchorEl }: Props): ReactElement {
    const description = suggestion != null ? getRangeDescription(suggestion.from, suggestion.to) : null
    const isOpen = focused && suggestion != null

    return (
        <Popover anchorEl={anchorEl} open={isOpen} onClose={() => void 0} placement="top" aria-expanded={isOpen}>
            <Popover.Content role="region" aria-labelledby="popover-shorthand-hint">
                <Detail className="font-ax-bold" id="popover-shorthand-hint">
                    Trykk <span className="font-mono px-1 bg-ax-bg-neutral-soft rounded-sm text-xs">Enter</span> for å
                    bruke følgende datoer
                </Detail>
                {description?.top && <Detail className="mt-1">{description?.top}</Detail>}
                {description?.bottom && <BodyShort>{description?.bottom}</BodyShort>}
            </Popover.Content>
        </Popover>
    )
}
