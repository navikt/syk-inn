import React, { ReactElement } from 'react'
import { BodyShort, Detail, Popover } from '@navikt/ds-react'

import { getShorthandRange } from '@features/ny-sykmelding-form/aktivitet/periode/periode-shorthand'
import { getRangeDescription } from '@features/ny-sykmelding-form/aktivitet/periode/periode-utils'

type Props = {
    selectedFom: string | null
    focusedField: 'fom' | 'tom' | null
    fomInputValue: string | null
    tomInputValue: string | null
    fomAnchorEl: Element | null
    tomAnchorEl: Element | null
}

/**
 * Custom Popover that displays a hint when the user is focused and has typed a valid shorthand date range
 */
export function ShorthandHint({
    selectedFom,
    fomAnchorEl,
    tomAnchorEl,
    focusedField,
    fomInputValue,
    tomInputValue,
}: Props): ReactElement {
    const suggestedRange = getShorthandRange(
        selectedFom,
        focusedField,
        focusedField === 'fom' ? fomInputValue : tomInputValue,
    )
    const description = suggestedRange != null ? getRangeDescription(suggestedRange.from, suggestedRange.to) : null
    const isOpen = focusedField != null && suggestedRange != null

    return (
        <Popover
            anchorEl={focusedField === 'fom' ? fomAnchorEl : tomAnchorEl}
            open={isOpen}
            onClose={() => void 0}
            placement="top"
            aria-expanded={isOpen}
            arrow={false}
        >
            <Popover.Content role="region" aria-labelledby="popover-shorthand-hint">
                <Detail className="font-bold" id="popover-shorthand-hint">
                    Trykk <span className="font-mono px-1 bg-bg-subtle rounded-sm text-xs">Enter</span> for å bruke
                    følgende datoer
                </Detail>
                {description?.top && <Detail className="mt-1">{description?.top}</Detail>}
                {description?.bottom && <BodyShort>{description?.bottom}</BodyShort>}
            </Popover.Content>
        </Popover>
    )
}
