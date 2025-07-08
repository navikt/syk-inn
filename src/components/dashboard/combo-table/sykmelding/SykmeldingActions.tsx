import React, { ReactElement } from 'react'
import { Button, Tooltip } from '@navikt/ds-react'
import { ChevronRightDoubleCircleIcon, ChevronRightIcon, TabsAddIcon } from '@navikt/aksel-icons'

import { SlowNextLinkButton } from '@components/misc/SlowNextLinkButton'

/**
 * Temporary flag to hide the unimplemented buttons while keeping TSC and lint happy.
 */
const IMPLEMENTATION_FLAG = false

export function SykmeldingActions({
    sykmeldingId,
    forlengable,
}: {
    sykmeldingId: string
    forlengable?: true
}): ReactElement {
    return (
        <div className="grid grid-cols-3 gap-2 w-fit ml-2">
            <Tooltip content="Se sykmelding">
                <SlowNextLinkButton
                    href={`/fhir/sykmelding/${sykmeldingId}`}
                    icon={<ChevronRightIcon aria-hidden />}
                    variant="tertiary"
                    size="small"
                />
            </Tooltip>
            {IMPLEMENTATION_FLAG && (
                <>
                    <Tooltip content="Dupliser sykmeldingen">
                        <Button icon={<TabsAddIcon aria-hidden />} variant="tertiary" size="small" />
                    </Tooltip>
                    {forlengable && (
                        <Tooltip content="Forleng sykmeldingen">
                            <Button
                                icon={<ChevronRightDoubleCircleIcon aria-hidden />}
                                variant="tertiary"
                                size="small"
                            />
                        </Tooltip>
                    )}
                </>
            )}
        </div>
    )
}
